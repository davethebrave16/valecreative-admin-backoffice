import {
	Edit,
	SimpleForm,
	TextInput,
	SelectInput,
	SaveButton,
	Toolbar,
	required,
} from 'react-admin'
import { Divider, Typography } from '@mui/material'
import { TECHNIQUE_FIELDS, TECHNIQUE_CATEGORIES, TECHNIQUE_CATEGORY_LABELS } from '../../types'

const categoryChoices = TECHNIQUE_CATEGORIES.map(c => ({
	id: c,
	name: TECHNIQUE_CATEGORY_LABELS[c],
}))

const TechniqueEditToolbar = () => (
	<Toolbar>
		<SaveButton />
	</Toolbar>
)

export const TechniqueEdit = () => (
	<Edit title="Edit Technique">
		<SimpleForm toolbar={<TechniqueEditToolbar />}>
			<TextInput
				source={TECHNIQUE_FIELDS.NAME}
				label="Name"
				validate={[required()]}
				fullWidth
			/>
			<TextInput
				source={TECHNIQUE_FIELDS.SLUG}
				label="Slug"
				fullWidth
				helperText="Changing the slug will break public URLs."
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Details</Typography>

			<SelectInput
				source={TECHNIQUE_FIELDS.CATEGORY}
				label="Category"
				choices={categoryChoices}
				validate={[required()]}
				fullWidth
			/>
			<TextInput
				source={TECHNIQUE_FIELDS.DESCRIPTION}
				label="Description"
				multiline
				rows={4}
				fullWidth
			/>
		</SimpleForm>
	</Edit>
)
