import {
	Create,
	SimpleForm,
	TextInput,
	SaveButton,
	Toolbar,
	required,
} from 'react-admin'
import { Divider, Typography } from '@mui/material'
import { CATEGORY_FIELDS } from '../../types'
import { toSlug } from '../../utils/slugify'
import { SlugAutoFillInput } from '../../components/SlugInput'

const CategoryCreateToolbar = () => (
	<Toolbar>
		<SaveButton />
	</Toolbar>
)

const transform = (data: Record<string, unknown>) => ({
	...data,
	slug: data.slug || toSlug(String(data.name ?? '')),
})

export const CategoryCreate = () => (
	<Create title="Create Category" transform={transform}>
		<SimpleForm toolbar={<CategoryCreateToolbar />}>
			<TextInput
				source={CATEGORY_FIELDS.NAME}
				label="Name"
				validate={[required()]}
				fullWidth
			/>
			<SlugAutoFillInput source={CATEGORY_FIELDS.SLUG} fromSource={CATEGORY_FIELDS.NAME} />
			<TextInput
				source={CATEGORY_FIELDS.DESCRIPTION}
				label="Description"
				multiline
				rows={4}
				fullWidth
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">English (optional)</Typography>

			<TextInput
				source={CATEGORY_FIELDS.NAME_EN}
				label="Name (English)"
				fullWidth
			/>
			<TextInput
				source={CATEGORY_FIELDS.DESCRIPTION_EN}
				label="Description (English)"
				multiline
				rows={4}
				fullWidth
			/>
		</SimpleForm>
	</Create>
)
