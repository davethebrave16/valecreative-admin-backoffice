import {
	Edit,
	SimpleForm,
	TextInput,
	SaveButton,
	Toolbar,
	required,
} from 'react-admin'
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
		</SimpleForm>
	</Edit>
)
