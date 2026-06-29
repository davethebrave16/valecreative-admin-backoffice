import {
	List,
	Datagrid,
	TextField,
	DateField,
	BooleanField,
	NumberField,
	TopToolbar,
	CreateButton,
	TextInput,
	BooleanInput,
	ReferenceInput,
	SelectInput,
} from 'react-admin'
import { ARTWORK_FIELDS } from '../../types'

const ArtworkFilters = [
	<TextInput key="title" source={ARTWORK_FIELDS.TITLE} label="Title" alwaysOn />,
	<ReferenceInput key="techniqueId" source={ARTWORK_FIELDS.TECHNIQUE_ID} reference="techniques">
		<SelectInput label="Technique" optionText="name" />
	</ReferenceInput>,
	<ReferenceInput key="seriesId" source={ARTWORK_FIELDS.SERIES_ID} reference="series">
		<SelectInput label="Series" optionText="name" />
	</ReferenceInput>,
	<BooleanInput key="available" source={ARTWORK_FIELDS.AVAILABLE} label="Available" />,
	<BooleanInput key="featured" source={ARTWORK_FIELDS.FEATURED} label="Featured" />,
]

const ListActions = () => (
	<TopToolbar>
		<CreateButton />
	</TopToolbar>
)

export const ArtworkList = () => (
	<List
		filters={ArtworkFilters}
		actions={<ListActions />}
		sort={{ field: ARTWORK_FIELDS.CREATED_AT, order: 'DESC' }}
	>
		<Datagrid rowClick="show" bulkActionButtons={false}>
			<TextField source={ARTWORK_FIELDS.TITLE} label="Title" />
			<TextField source={ARTWORK_FIELDS.SLUG} label="Slug" />
			<NumberField source={ARTWORK_FIELDS.YEAR} label="Year" />
			<BooleanField source={ARTWORK_FIELDS.AVAILABLE} label="Available" />
			<BooleanField source={ARTWORK_FIELDS.FEATURED} label="Featured" />
			<DateField source={ARTWORK_FIELDS.CREATED_AT} label="Created" />
		</Datagrid>
	</List>
)
