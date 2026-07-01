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

const HeroSaveButton = () => {
	const [open, setOpen] = useState(false)
	const existingHero = useRef<Artwork | null>(null)
	const record = useRecordContext<Artwork>()
	const { save } = useSaveContext()
	const { getValues, handleSubmit } = useFormContext()

	const doSave = (values: Record<string, unknown>) => save?.(values)

	const onClickSave = handleSubmit(async (values) => {
		if (values[ARTWORK_FIELDS.IS_HERO]) {
			const snap = await getDocs(
				query(collection(db, 'artworks'), where('isHero', '==', true), limit(2))
			)
			const other = snap.docs
				.map((d) => ({ id: d.id, ...d.data() } as Artwork))
				.find((a) => a.id !== record?.id)
			if (other) {
				existingHero.current = other
				setOpen(true)
				return
			}
		}
		doSave(values)
	})

	const handleConfirm = async () => {
		setOpen(false)
		if (existingHero.current) {
			try { await save?.({ ...existingHero.current, isHero: false }) } catch {}
		}
		doSave(getValues())
	}

	return (
		<>
			<SaveButton onClick={onClickSave} />
			<Dialog open={open} onClose={() => setOpen(false)}>
				<DialogTitle>Replace homepage hero?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						<strong>"{existingHero.current?.title}"</strong> is currently the homepage hero.
						Setting this artwork as hero will remove it from that position.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)}>Cancel</Button>
					<Button onClick={handleConfirm} variant="contained" color="primary">Replace</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}

const ArtworkEditToolbar = () => (
	<Toolbar sx={{ gap: 1 }}>
		<HeroSaveButton />
		<ConfirmDeleteButton />
	</Toolbar>
)

export const ArtworkEdit = () => (
	<Edit title="Edit Artwork">
		<SimpleForm toolbar={<ArtworkEditToolbar />}>
			<TextInput
				source={ARTWORK_FIELDS.TITLE}
				label="Title"
				validate={[required()]}
				fullWidth
			/>
			<TextInput
				source={ARTWORK_FIELDS.SLUG}
				label="Slug"
				fullWidth
				helperText="Changing the slug will break public URLs."
			/>
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
			<Typography variant="subtitle2" color="textSecondary">Cover Image</Typography>

			<ImageUploadInput
				source={ARTWORK_FIELDS.COVER_IMAGE}
				storagePath="artworks"
				label="Cover image"
			/>
		</SimpleForm>
	</Edit>
)
