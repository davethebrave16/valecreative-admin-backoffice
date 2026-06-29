import {
	Show,
	SimpleShowLayout,
	TextField,
	DateField,
	TopToolbar,
	EditButton,
} from 'react-admin'
import { Divider, Typography } from '@mui/material'
import { TECHNIQUE_FIELDS } from '../../types'
import { GuardedDeleteButton } from '../../components/GuardedDeleteButton'

const TechniqueShowActions = () => (
	<TopToolbar>
		<EditButton />
		<GuardedDeleteButton checkField="techniqueId" resourceLabel="technique" />
	</TopToolbar>
)

export const TechniqueShow = () => (
	<Show actions={<TechniqueShowActions />}>
		<SimpleShowLayout>
			<TextField source={TECHNIQUE_FIELDS.NAME} label="Name" />
			<TextField source={TECHNIQUE_FIELDS.SLUG} label="Slug" />
			<TextField source={TECHNIQUE_FIELDS.CATEGORY} label="Category" />
			<TextField source={TECHNIQUE_FIELDS.DESCRIPTION} label="Description" />

			<Divider sx={{ my: 2 }} />
			<Typography variant="subtitle2" color="textSecondary">Timestamps</Typography>

			<DateField source={TECHNIQUE_FIELDS.CREATED_AT} label="Created At" showTime />
			<DateField source={TECHNIQUE_FIELDS.UPDATED_AT} label="Updated At" showTime />
		</SimpleShowLayout>
	</Show>
)
