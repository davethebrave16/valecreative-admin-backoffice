import {
	List,
	Datagrid,
	TextField,
	DateField,
	TopToolbar,
	CreateButton,
	TextInput,
	SelectInput,
} from 'react-admin'
import { TECHNIQUE_FIELDS, TECHNIQUE_CATEGORIES, TECHNIQUE_CATEGORY_LABELS } from '../../types'

const categoryChoices = TECHNIQUE_CATEGORIES.map(c => ({
	id: c,
	name: TECHNIQUE_CATEGORY_LABELS[c],
}))

const TechniqueFilters = [
	<TextInput key="name" source={TECHNIQUE_FIELDS.NAME} label="Name" alwaysOn />,
	<SelectInput key="category" source={TECHNIQUE_FIELDS.CATEGORY} label="Category" choices={categoryChoices} />,
]

const ListActions = () => (
	<TopToolbar>
		<CreateButton />
	</TopToolbar>
)

export const TechniqueList = () => (
	<List filters={TechniqueFilters} actions={<ListActions />}>
		<Datagrid rowClick="show" bulkActionButtons={false}>
			<TextField source={TECHNIQUE_FIELDS.NAME} label="Name" />
			<TextField source={TECHNIQUE_FIELDS.SLUG} label="Slug" />
			<TextField source={TECHNIQUE_FIELDS.CATEGORY} label="Category" />
			<DateField source={TECHNIQUE_FIELDS.CREATED_AT} label="Created" />
		</Datagrid>
	</List>
)
