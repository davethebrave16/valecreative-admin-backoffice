import {
	Edit,
	SimpleForm,
	TextInput,
	NumberInput,
	BooleanInput,
	SaveButton,
	Toolbar,
	required,
} from 'react-admin'
import { Divider, Typography } from '@mui/material'
import { SERIES_FIELDS } from '../../types'

const SeriesEditToolbar = () => (
	<Toolbar>
		<SaveButton />
	</Toolbar>
)

export const SeriesEdit = () => (
	<Edit title="Edit Series">
		<SimpleForm toolbar={<SeriesEditToolbar />}>
			<TextInput
				source={SERIES_FIELDS.NAME}
				label="Name"
				validate={[required()]}
				fullWidth
			/>
			<TextInput
				source={SERIES_FIELDS.SLUG}
				label="Slug"
				fullWidth
				helperText="Changing the slug will break public URLs."
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Publication</Typography>

			<BooleanInput source={SERIES_FIELDS.PUBLISHED} label="Published" />
			<NumberInput
				source={SERIES_FIELDS.ORDER}
				label="Order"
				helperText="Lower numbers appear first."
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Description</Typography>

			<TextInput
				source={SERIES_FIELDS.DESCRIPTION}
				label="Description"
				multiline
				rows={4}
				fullWidth
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Cover Image</Typography>

			<TextInput
				source="coverImage.original"
				label="Original URL"
				fullWidth
				helperText="Firebase Storage download URL for the full-resolution image."
			/>
			<TextInput
				source="coverImage.alt"
				label="Alt Text"
				fullWidth
			/>
			<NumberInput
				source="coverImage.width"
				label="Width (px)"
				sx={{ mr: 2 }}
			/>
			<NumberInput
				source="coverImage.height"
				label="Height (px)"
			/>
			<TextInput
				source="coverImage.blurHash"
				label="BlurHash"
				fullWidth
			/>
		</SimpleForm>
	</Edit>
)
