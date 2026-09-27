import { useState, useRef } from 'react'
import {
	Edit,
	SimpleForm,
	TextInput,
	NumberInput,
	ReferenceInput,
	ReferenceArrayInput,
	SelectInput,
	AutocompleteArrayInput,
	SaveButton,
	Toolbar,
	required,
	useRecordContext,
	useSaveContext,
} from 'react-admin'
import { useWatch, useFormContext } from 'react-hook-form'
import { Divider, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { ARTWORK_FIELDS } from '../../types'
import type { Artwork } from '../../types'
import { db } from '../../firebase'
import { ImageUploadInput } from '../../components/ImageUploadInput'
import { ConfirmDeleteButton } from '../../components/ConfirmDeleteButton'
import { SlugConflictDialog } from '../../components/SlugConflictDialog'
import { findArtworkBySlug } from '../../utils/artworkSlugCheck'
import { SlugEditInput } from '../../components/SlugInput'

const ConditionalPriceInput = () => {
	const availability = useWatch({ name: ARTWORK_FIELDS.AVAILABILITY })
	if (availability !== 'for_sale') return null
	return (
		<NumberInput
			source={ARTWORK_FIELDS.PRICE}
			label="Price (€)"
			helperText="Required when availability is For Sale."
		/>
	)
}

type ExclusiveField = {
	field: string
	dbField: 'isHero' | 'isIntro'
	dialogTitle: string
	positionLabel: string
}

const EXCLUSIVE_FIELDS: ExclusiveField[] = [
	{
		field: ARTWORK_FIELDS.IS_HERO,
		dbField: 'isHero',
		dialogTitle: 'Replace homepage hero?',
		positionLabel: 'the homepage hero',
	},
	{
		field: ARTWORK_FIELDS.IS_INTRO,
		dbField: 'isIntro',
		dialogTitle: 'Replace homepage intro image?',
		positionLabel: 'the homepage intro image',
	},
]

const ArtworkSaveButton = () => {
	const [dialog, setDialog] = useState<{ config: ExclusiveField; other: Artwork } | null>(null)
	const [slugConflict, setSlugConflict] = useState<{ slug: string; artwork: Artwork } | null>(null)
	const resolverRef = useRef<((confirmed: boolean) => void) | null>(null)
	const record = useRecordContext<Artwork>()
	const { save } = useSaveContext()
	const { handleSubmit } = useFormContext()

	const handleDialogClose = (confirmed: boolean) => {
		resolverRef.current?.(confirmed)
	}

	const onClickSave = handleSubmit(async (values) => {
		const slug = String(values[ARTWORK_FIELDS.SLUG] || '')
		const conflictingArtwork = await findArtworkBySlug(slug, record?.id as string | undefined)
		if (conflictingArtwork) {
			setSlugConflict({ slug, artwork: conflictingArtwork })
			return
		}

		const clears: Array<{ artwork: Artwork; dbField: 'isHero' | 'isIntro' }> = []

		for (const config of EXCLUSIVE_FIELDS) {
			if (!values[config.field]) continue
			const snap = await getDocs(
				query(collection(db, 'artworks'), where(config.dbField, '==', true), limit(2))
			)
			const other = snap.docs
				.map((d) => ({ id: d.id, ...d.data() } as Artwork))
				.find((a) => a.id !== record?.id)
			if (!other) continue

			const confirmed = await new Promise<boolean>((resolve) => {
				resolverRef.current = resolve
				setDialog({ config, other })
			})
			setDialog(null)
			if (!confirmed) return
			clears.push({ artwork: other, dbField: config.dbField })
		}

		for (const clear of clears) {
			try { await save?.({ ...clear.artwork, [clear.dbField]: false }) } catch {}
		}
		save?.(values)
	})

	return (
		<>
			<SaveButton onClick={onClickSave} />
			<Dialog open={!!dialog} onClose={() => handleDialogClose(false)}>
				<DialogTitle>{dialog?.config.dialogTitle}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						<strong>"{dialog?.other.title}"</strong> is currently {dialog?.config.positionLabel}.
						Setting this artwork will remove it from that position.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleDialogClose(false)}>Cancel</Button>
					<Button onClick={() => handleDialogClose(true)} variant="contained" color="primary">Replace</Button>
				</DialogActions>
			</Dialog>
			<SlugConflictDialog
				open={!!slugConflict}
				slug={slugConflict?.slug}
				conflict={slugConflict?.artwork}
				onClose={() => setSlugConflict(null)}
			/>
		</>
	)
}

const ArtworkEditToolbar = () => (
	<Toolbar sx={{ gap: 1 }}>
		<ArtworkSaveButton />
		<ConfirmDeleteButton />
	</Toolbar>
)

export const ArtworkEdit = () => (
	<Edit title="Edit Artwork">
		<SimpleForm toolbar={<ArtworkEditToolbar />}>
			<Typography variant="subtitle2" color="textSecondary">Cover Image</Typography>

			<ImageUploadInput
				source={ARTWORK_FIELDS.COVER_IMAGE}
				storagePath="artworks"
				label="Cover image"
			/>

			<Divider sx={{ my: 2, width: '100%' }} />

			<TextInput
				source={ARTWORK_FIELDS.TITLE}
				label="Title"
				validate={[required()]}
				fullWidth
			/>
			<SlugEditInput source={ARTWORK_FIELDS.SLUG} />
			<NumberInput
				source={ARTWORK_FIELDS.YEAR}
				label="Year"
				validate={[required()]}
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Classification</Typography>

			<ReferenceInput source={ARTWORK_FIELDS.TECHNIQUE_ID} reference="techniques">
				<SelectInput
					label="Technique"
					optionText="name"
					validate={[required()]}
					fullWidth
				/>
			</ReferenceInput>
			<ReferenceInput source={ARTWORK_FIELDS.SERIES_ID} reference="series">
				<SelectInput
					label="Series"
					optionText="name"
					fullWidth
					emptyText="— None —"
				/>
			</ReferenceInput>
			<ReferenceArrayInput source={ARTWORK_FIELDS.CATEGORY_IDS} reference="categories">
				<AutocompleteArrayInput
					label="Categories"
					optionText="name"
					validate={[required()]}
					helperText="At least one category required."
					fullWidth
				/>
			</ReferenceArrayInput>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Origin & Availability</Typography>

			<SelectInput
				source={ARTWORK_FIELDS.ORIGIN}
				label="Origin"
				validate={[required()]}
				choices={[
					{ id: 'personal', name: 'Personal' },
					{ id: 'commissioned', name: 'Commissioned' },
				]}
			/>
			<SelectInput
				source={ARTWORK_FIELDS.AVAILABILITY}
				label="Availability"
				validate={[required()]}
				choices={[
					{ id: 'for_sale', name: 'For Sale' },
					{ id: 'sold', name: 'Sold' },
					{ id: 'not_for_sale', name: 'Not for Sale' },
				]}
			/>
			<ConditionalPriceInput />
			<SelectInput
				source={ARTWORK_FIELDS.FEATURED}
				label="Featured"
				choices={[
					{ id: true, name: 'Yes' },
					{ id: false, name: 'No' },
				]}
			/>
			<SelectInput
				source={ARTWORK_FIELDS.IS_HERO}
				label="Homepage Hero"
				helperText="Set to Yes on exactly one artwork to pin it as the homepage hero image."
				choices={[
					{ id: true, name: 'Yes' },
					{ id: false, name: 'No' },
				]}
			/>
			<SelectInput
				source={ARTWORK_FIELDS.IS_INTRO}
				label="Homepage Intro Image"
				helperText="Set to Yes on exactly one artwork to pin it as the homepage intro image."
				choices={[
					{ id: true, name: 'Yes' },
					{ id: false, name: 'No' },
				]}
			/>
			<SelectInput
				source={ARTWORK_FIELDS.SHOW_ON_ABOUT_PAGE}
				label="Show on About Page"
				helperText="Yes to feature this artwork's cover image in the portraits section of the About page."
				choices={[
					{ id: true, name: 'Yes' },
					{ id: false, name: 'No' },
				]}
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Dimensions & Support</Typography>

			<NumberInput source={ARTWORK_FIELDS.DIMENSIONS_HEIGHT} label="Height" />
			<NumberInput source={ARTWORK_FIELDS.DIMENSIONS_WIDTH} label="Width" />
			<TextInput
				source={ARTWORK_FIELDS.DIMENSIONS_UNIT}
				label="Unit"
				helperText="e.g. cm, mm, in"
			/>
			<TextInput
				source={ARTWORK_FIELDS.SUPPORT}
				label="Support"
				fullWidth
				helperText="e.g. canvas, wood panel, paper"
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Description</Typography>

			<TextInput
				source={ARTWORK_FIELDS.DESCRIPTION}
				label="Description"
				multiline
				rows={4}
				fullWidth
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">English (optional)</Typography>

			<TextInput
				source={ARTWORK_FIELDS.TITLE_EN}
				label="Title (English)"
				fullWidth
			/>
			<TextInput
				source={ARTWORK_FIELDS.DESCRIPTION_EN}
				label="Description (English)"
				multiline
				rows={4}
				fullWidth
			/>

		</SimpleForm>
	</Edit>
)
