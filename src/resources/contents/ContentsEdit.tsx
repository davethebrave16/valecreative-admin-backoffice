import {
	Edit,
	SimpleForm,
	TextInput,
	BooleanInput,
	SaveButton,
	Toolbar,
	required,
} from 'react-admin'
import { Divider, Typography } from '@mui/material'
import { CONTENT_FIELDS } from '../../types'
import { ImageUploadInput } from '../../components/ImageUploadInput'

const ContentsEditToolbar = () => (
	<Toolbar>
		<SaveButton />
	</Toolbar>
)

export const ContentsEdit = () => (
	<Edit title="Edit Content">
		<SimpleForm toolbar={<ContentsEditToolbar />}>
			<TextInput
				source={CONTENT_FIELDS.TITLE}
				label="Title"
				validate={[required()]}
				fullWidth
			/>
			<TextInput
				source={CONTENT_FIELDS.SLUG}
				label="Slug"
				fullWidth
				helperText="Changing the slug will break frontend URLs."
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Publication</Typography>

			<BooleanInput
				source={CONTENT_FIELDS.PUBLISHED}
				label="Published"
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Content</Typography>

			<TextInput
				source={CONTENT_FIELDS.BODY}
				label="Body (HTML)"
				validate={[required()]}
				multiline
				rows={10}
				fullWidth
				helperText="Enter HTML content. Tags like <p>, <strong>, <em>, <a>, <ul> etc. are supported."
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Image (optional)</Typography>

			<ImageUploadInput
				source={CONTENT_FIELDS.IMAGE}
				storagePath="contents"
				label="Image"
			/>
		</SimpleForm>
	</Edit>
)
