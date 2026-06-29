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
} from 'react-admin'
import { SERIES_FIELDS } from '../../types'

const SeriesFilters = [
	<TextInput key="name" source={SERIES_FIELDS.NAME} label="Name" alwaysOn />,
	<BooleanInput key="published" source={SERIES_FIELDS.PUBLISHED} label="Published" />,
]

const ListActions = () => (
	<TopToolbar>
		<CreateButton />
	</TopToolbar>
)

export const SeriesList = () => (
	<List
		filters={SeriesFilters}
		actions={<ListActions />}
		sort={{ field: SERIES_FIELDS.ORDER, order: 'ASC' }}
	>
		<Datagrid rowClick="show" bulkActionButtons={false}>
			<TextField source={SERIES_FIELDS.NAME} label="Name" />
			<TextField source={SERIES_FIELDS.SLUG} label="Slug" />
			<BooleanField source={SERIES_FIELDS.PUBLISHED} label="Published" />
			<NumberField source={SERIES_FIELDS.ORDER} label="Order" />
			<DateField source={SERIES_FIELDS.CREATED_AT} label="Created" />
		</Datagrid>
	</List>
)
