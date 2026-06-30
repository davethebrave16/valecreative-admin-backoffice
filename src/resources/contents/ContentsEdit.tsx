import {
	Edit,
	SimpleForm,
	TextInput,
	BooleanInput,
	SaveButton,
	Toolbar,
	required,
	useRecordContext,
} from 'react-admin'
import { RichTextInput } from 'ra-input-rich-text'
import { Divider, Typography } from '@mui/material'
import { CONTENT_FIELDS } from '../../types'
import { ImageUploadInput } from '../../components/ImageUploadInput'

const ContentsEditToolbar = () => (
	<Toolbar>
		<SaveButton />
	</Toolbar>
)

const editorSx = { '& .ProseMirror': { minHeight: 240 } }

// Keyed on record.id so Tiptap remounts after the async record arrives and
// picks up the saved HTML content correctly.
const BodyInput = () => {
	const record = useRecordContext()
	return (
		<RichTextInput
			key={record?.id ?? 'new'}
			source={CONTENT_FIELDS.BODY}
			label="Body"
			validate={[required()]}
			fullWidth
			sx={editorSx}
		/>
	)
}

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

			<BodyInput />

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
