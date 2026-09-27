import {
	Create,
	SimpleForm,
	TextInput,
	BooleanInput,
	SaveButton,
	Toolbar,
	required,
} from 'react-admin'
import { RichTextInput } from 'ra-input-rich-text'
import { Divider, Typography } from '@mui/material'
import { CONTENT_FIELDS } from '../../types'
import { toSlug } from '../../utils/slugify'
import { SlugAutoFillInput } from '../../components/SlugInput'
import { ImageUploadInput } from '../../components/ImageUploadInput'

const ContentsCreateToolbar = () => (
	<Toolbar>
		<SaveButton />
	</Toolbar>
)

const transform = (data: Record<string, unknown>) => ({
	...data,
	slug: data.slug || toSlug(String(data.title ?? '')),
})

export const ContentsCreate = () => (
	<Create title="Create Content" transform={transform}>
		<SimpleForm toolbar={<ContentsCreateToolbar />}>
			<TextInput
				source={CONTENT_FIELDS.TITLE}
				label="Title"
				validate={[required()]}
				fullWidth
			/>
			<SlugAutoFillInput source={CONTENT_FIELDS.SLUG} fromSource={CONTENT_FIELDS.TITLE} allowUnderscore helperText="Auto-filled from title. Override manually (e.g. bio, homepage_hero, statement)." />

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Publication</Typography>

			<BooleanInput
				source={CONTENT_FIELDS.PUBLISHED}
				label="Published"
				defaultValue={false}
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Content</Typography>

			<RichTextInput
				source={CONTENT_FIELDS.BODY}
				label="Body"
				validate={[required()]}
				fullWidth
				sx={{ '& .ProseMirror': { minHeight: 240 } }}
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">English (optional)</Typography>

			<TextInput
				source={CONTENT_FIELDS.TITLE_EN}
				label="Title (English)"
				fullWidth
			/>
			<RichTextInput
				source={CONTENT_FIELDS.BODY_EN}
				label="Body (English)"
				fullWidth
				sx={{ '& .ProseMirror': { minHeight: 240 } }}
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Image (optional)</Typography>

			<ImageUploadInput
				source={CONTENT_FIELDS.IMAGE}
				storagePath="contents"
				label="Image"
			/>
		</SimpleForm>
	</Create>
)
