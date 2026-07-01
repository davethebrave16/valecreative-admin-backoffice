import {
	List,
	Datagrid,
	TextField,
	DateField,
} from 'react-admin'
import { CATEGORY_FIELDS } from '../../types'

export const CategoriesList = () => (
	<List title="Categories" sort={{ field: 'name', order: 'ASC' }}>
		<Datagrid rowClick="show" bulkActionButtons={false}>
			<TextField source={CATEGORY_FIELDS.NAME} label="Name" />
			<TextField source={CATEGORY_FIELDS.SLUG} label="Slug" />
			<DateField source={CATEGORY_FIELDS.CREATED_AT} label="Created At" showTime />
		</Datagrid>
	</List>
)
