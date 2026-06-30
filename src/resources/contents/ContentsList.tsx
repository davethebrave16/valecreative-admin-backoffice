import {
	List,
	Datagrid,
	TextField,
	DateField,
	BooleanField,
	TopToolbar,
	CreateButton,
	TextInput,
	BooleanInput,
} from 'react-admin'
import { CONTENT_FIELDS } from '../../types'

const ContentsFilters = [
	<TextInput key="slug" source={CONTENT_FIELDS.SLUG} label="Slug" alwaysOn />,
	<TextInput key="title" source={CONTENT_FIELDS.TITLE} label="Title" />,
	<BooleanInput key="published" source={CONTENT_FIELDS.PUBLISHED} label="Published" />,
]

const ListActions = () => (
	<TopToolbar>
		<CreateButton />
	</TopToolbar>
)

export const ContentsList = () => (
	<List filters={ContentsFilters} actions={<ListActions />}>
		<Datagrid rowClick="show" bulkActionButtons={false}>
			<TextField source={CONTENT_FIELDS.SLUG} label="Slug" />
			<TextField source={CONTENT_FIELDS.TITLE} label="Title" />
			<BooleanField source={CONTENT_FIELDS.PUBLISHED} label="Published" />
			<DateField source={CONTENT_FIELDS.UPDATED_AT} label="Updated" />
		</Datagrid>
	</List>
)
