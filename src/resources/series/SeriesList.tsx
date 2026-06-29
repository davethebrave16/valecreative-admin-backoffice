import {
	List,
	Datagrid,
	TextField,
	DateField,
	BooleanField,
	NumberField,
	FunctionField,
	TopToolbar,
	CreateButton,
	TextInput,
	BooleanInput,
} from 'react-admin'
import { SERIES_FIELDS } from '../../types'
import type { Series } from '../../types'

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
			<FunctionField<Series>
				label=""
				render={(record) =>
					record.coverImage?.thumb || record.coverImage?.original ? (
						<img
							src={record.coverImage.thumb ?? record.coverImage.original}
							alt={record.coverImage.alt ?? ''}
							style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, display: 'block' }}
						/>
					) : (
						<div style={{ width: 48, height: 48, borderRadius: 4, background: '#e0e0e0' }} />
					)
				}
			/>
			<TextField source={SERIES_FIELDS.NAME} label="Name" />
			<TextField source={SERIES_FIELDS.SLUG} label="Slug" />
			<BooleanField source={SERIES_FIELDS.PUBLISHED} label="Published" />
			<NumberField source={SERIES_FIELDS.ORDER} label="Order" />
			<DateField source={SERIES_FIELDS.CREATED_AT} label="Created" />
		</Datagrid>
	</List>
)
