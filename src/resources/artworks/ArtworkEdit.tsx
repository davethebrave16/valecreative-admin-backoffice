import {
	Edit,
	SimpleForm,
	TextInput,
	NumberInput,
	ReferenceInput,
	SelectInput,
	SaveButton,
	Toolbar,
	required,
} from 'react-admin'
import { useWatch } from 'react-hook-form'
import { Divider, Typography } from '@mui/material'
import { ARTWORK_FIELDS } from '../../types'
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

const ArtworkEditToolbar = () => (
	<Toolbar sx={{ gap: 1 }}>
		<SaveButton />
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
