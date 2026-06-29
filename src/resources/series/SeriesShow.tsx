import {
	Show,
	SimpleShowLayout,
	TextField,
	DateField,
	BooleanField,
	NumberField,
	UrlField,
	TopToolbar,
	EditButton,
} from 'react-admin'
import { Divider, Typography } from '@mui/material'
import { SERIES_FIELDS } from '../../types'

const SeriesShowActions = () => (
	<TopToolbar>
		<EditButton />
	</TopToolbar>
)

export const SeriesShow = () => (
	<Show actions={<SeriesShowActions />}>
		<SimpleShowLayout>
			<TextField source={SERIES_FIELDS.NAME} label="Name" />
			<TextField source={SERIES_FIELDS.SLUG} label="Slug" />
			<BooleanField source={SERIES_FIELDS.PUBLISHED} label="Published" />
			<NumberField source={SERIES_FIELDS.ORDER} label="Order" />
			<TextField source={SERIES_FIELDS.DESCRIPTION} label="Description" />

			<Divider sx={{ my: 2 }} />
			<Typography variant="subtitle2" color="textSecondary">Cover Image</Typography>

			<UrlField source="coverImage.original" label="Original URL" />
			<TextField source="coverImage.alt" label="Alt Text" />
			<NumberField source="coverImage.width" label="Width (px)" />
			<NumberField source="coverImage.height" label="Height (px)" />
			<TextField source="coverImage.blurHash" label="BlurHash" />

			<Divider sx={{ my: 2 }} />
			<Typography variant="subtitle2" color="textSecondary">Timestamps</Typography>

			<DateField source={SERIES_FIELDS.CREATED_AT} label="Created At" showTime />
			<DateField source={SERIES_FIELDS.UPDATED_AT} label="Updated At" showTime />
		</SimpleShowLayout>
	</Show>
)
