import {
	List,
	Datagrid,
	TextField,
	DateField,
} from 'react-admin'
import { CATEGORY_FIELDS } from '../../types'
import { FeaturedArtworkPreview } from '../../components/FeaturedArtworkPicker'

export const CategoriesList = () => (
	<List title="Categories" sort={{ field: 'name', order: 'ASC' }}>
		<Datagrid rowClick="show" bulkActionButtons={false}>
			<FeaturedArtworkPreview label="Featured" size="small" />
			<TextField source={CATEGORY_FIELDS.NAME} label="Name" />
			<TextField source={CATEGORY_FIELDS.SLUG} label="Slug" />
			<DateField source={CATEGORY_FIELDS.CREATED_AT} label="Created At" showTime />
		</Datagrid>
	</List>
)
