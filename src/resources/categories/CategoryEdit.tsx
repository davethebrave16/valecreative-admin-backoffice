import {
	Edit,
	SimpleForm,
	TextInput,
	SaveButton,
	Toolbar,
	required,
} from 'react-admin'
import { Divider, Typography } from '@mui/material'
import { CATEGORY_FIELDS } from '../../types'

const CategoryEditToolbar = () => (
	<Toolbar>
		<SaveButton />
	</Toolbar>
)

export const CategoryEdit = () => (
	<Edit title="Edit Category">
		<SimpleForm toolbar={<CategoryEditToolbar />}>
			<TextInput
				source={CATEGORY_FIELDS.NAME}
				label="Name"
				validate={[required()]}
				fullWidth
			/>
			<TextInput
				source={CATEGORY_FIELDS.SLUG}
				label="Slug"
				disabled
				fullWidth
				helperText="Slug is set at creation and cannot be changed to avoid breaking references."
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">English (optional)</Typography>

			<TextInput
				source={CATEGORY_FIELDS.NAME_EN}
				label="Name (English)"
				fullWidth
			/>
		</SimpleForm>
	</Edit>
)
