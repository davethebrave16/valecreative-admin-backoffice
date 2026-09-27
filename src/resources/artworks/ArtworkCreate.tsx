import { useState } from 'react'
import {
	Create,
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
	useSaveContext,
} from 'react-admin'
import { useWatch, useFormContext } from 'react-hook-form'
import { Divider, Typography } from '@mui/material'
import { ARTWORK_FIELDS } from '../../types'
import type { Artwork } from '../../types'
import { toSlug } from '../../utils/slugify'
import { SlugAutoFillInput } from '../../components/SlugInput'
import { ImageUploadInput } from '../../components/ImageUploadInput'
import { SlugConflictDialog } from '../../components/SlugConflictDialog'
import { findArtworkBySlug } from '../../utils/artworkSlugCheck'

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

const ArtworkCreateSaveButton = () => {
	const [conflict, setConflict] = useState<{ slug: string; artwork: Artwork } | null>(null)
	const { save } = useSaveContext()
	const { handleSubmit } = useFormContext()

	const onClickSave = handleSubmit(async (values) => {
		const slug = String(values[ARTWORK_FIELDS.SLUG] || toSlug(String(values.title ?? '')))
		const other = await findArtworkBySlug(slug)
		if (other) {
			setConflict({ slug, artwork: other })
			return
		}
		save?.(values)
	})

	return (
		<>
			<SaveButton onClick={onClickSave} />
			<SlugConflictDialog
				open={!!conflict}
				slug={conflict?.slug}
				conflict={conflict?.artwork}
				onClose={() => setConflict(null)}
			/>
		</>
	)
}

const ArtworkCreateToolbar = () => (
	<Toolbar>
		<ArtworkCreateSaveButton />
	</Toolbar>
)

const transform = (data: Record<string, unknown>) => ({
	...data,
	slug: data.slug || toSlug(String(data.title ?? '')),
})

export const ArtworkCreate = () => (
	<Create title="Create Artwork" transform={transform}>
		<SimpleForm toolbar={<ArtworkCreateToolbar />}>
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
			<SlugAutoFillInput source={ARTWORK_FIELDS.SLUG} fromSource={ARTWORK_FIELDS.TITLE} />
			<NumberInput
				source={ARTWORK_FIELDS.YEAR}
				label="Year"
				validate={[required()]}
				defaultValue={new Date().getFullYear()}
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
				defaultValue={false}
				choices={[
					{ id: true, name: 'Yes' },
					{ id: false, name: 'No' },
				]}
			/>
			<SelectInput
				source={ARTWORK_FIELDS.IS_HERO}
				label="Homepage Hero"
				defaultValue={false}
				helperText="Set to Yes on exactly one artwork to pin it as the homepage hero image."
				choices={[
					{ id: true, name: 'Yes' },
					{ id: false, name: 'No' },
				]}
			/>
			<SelectInput
				source={ARTWORK_FIELDS.IS_INTRO}
				label="Homepage Intro Image"
				defaultValue={false}
				helperText="Set to Yes on exactly one artwork to pin it as the homepage intro image."
				choices={[
					{ id: true, name: 'Yes' },
					{ id: false, name: 'No' },
				]}
			/>
			<SelectInput
				source={ARTWORK_FIELDS.SHOW_ON_ABOUT_PAGE}
				label="Show on About Page"
				defaultValue={false}
				helperText="Yes to feature this artwork's cover image in the portraits section of the About page."
				choices={[
					{ id: true, name: 'Yes' },
					{ id: false, name: 'No' },
				]}
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Dimensions & Support</Typography>

			<NumberInput
				source={ARTWORK_FIELDS.DIMENSIONS_HEIGHT}
				label="Height"
				helperText="Height in the unit specified below."
			/>
			<NumberInput
				source={ARTWORK_FIELDS.DIMENSIONS_WIDTH}
				label="Width"
				helperText="Width in the unit specified below."
			/>
			<TextInput
				source={ARTWORK_FIELDS.DIMENSIONS_UNIT}
				label="Unit"
				defaultValue="cm"
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
	</Create>
)
