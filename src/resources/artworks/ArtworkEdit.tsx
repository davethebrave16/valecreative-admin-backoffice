import {
	Edit,
	SimpleForm,
	TextInput,
	NumberInput,
	BooleanInput,
	ReferenceInput,
	SelectInput,
	SaveButton,
	DeleteButton,
	Toolbar,
	required,
} from 'react-admin'
import { Divider, Typography } from '@mui/material'
import { ARTWORK_FIELDS } from '../../types'
import { ArtworkImagesInput } from './ArtworkImagesInput'

const ArtworkEditToolbar = () => (
	<Toolbar sx={{ gap: 1 }}>
		<SaveButton />
		<DeleteButton />
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
			<Typography variant="subtitle2" color="textSecondary">Availability</Typography>

			<BooleanInput source={ARTWORK_FIELDS.AVAILABLE} label="Available" />
			<NumberInput
				source={ARTWORK_FIELDS.PRICE}
				label="Price (€)"
				helperText="Leave empty if not for sale."
			/>
			<BooleanInput source={ARTWORK_FIELDS.FEATURED} label="Featured" />

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
			<Typography variant="subtitle2" color="textSecondary">Images</Typography>

			<ArtworkImagesInput source={ARTWORK_FIELDS.IMAGES} storagePath="artworks" />
		</SimpleForm>
	</Edit>
)
