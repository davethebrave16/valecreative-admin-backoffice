import {
	Show,
	SimpleShowLayout,
	TextField,
	DateField,
	TopToolbar,
	EditButton,
} from 'react-admin'
import { Divider, Typography } from '@mui/material'
import { CATEGORY_FIELDS } from '../../types'
import { GuardedDeleteButton } from '../../components/GuardedDeleteButton'

const CategoryShowActions = () => (
	<TopToolbar>
		<EditButton />
		<GuardedDeleteButton checkArrayField="categoryIds" resourceLabel="category" />
	</TopToolbar>
)

export const CategoryShow = () => (
	<Show actions={<CategoryShowActions />}>
		<SimpleShowLayout>
			<TextField source={CATEGORY_FIELDS.NAME} label="Name" />
			<TextField source={CATEGORY_FIELDS.SLUG} label="Slug" />

			<Divider sx={{ my: 2 }} />
			<Typography variant="subtitle2" color="textSecondary">Timestamps</Typography>

			<DateField source={CATEGORY_FIELDS.CREATED_AT} label="Created At" showTime />
			<DateField source={CATEGORY_FIELDS.UPDATED_AT} label="Updated At" showTime />
		</SimpleShowLayout>
	</Show>
)
