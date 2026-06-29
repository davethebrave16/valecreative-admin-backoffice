import {
	Show,
	SimpleShowLayout,
	TextField,
	DateField,
	BooleanField,
	NumberField,
	UrlField,
	FunctionField,
	TopToolbar,
	EditButton,
} from 'react-admin'
import { Divider, Typography } from '@mui/material'
import { SERIES_FIELDS } from '../../types'
import type { Series } from '../../types'

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

			<FunctionField<Series>
				label="Preview"
				render={(record) =>
					record.coverImage?.original ? (
						<img
							src={record.coverImage.original}
							alt={record.coverImage.alt ?? ''}
							style={{
								maxWidth: 480,
								maxHeight: 320,
								objectFit: 'contain',
								display: 'block',
								borderRadius: 4,
								border: '1px solid #e0e0e0',
							}}
						/>
					) : null
				}
			/>
			<TextField source="coverImage.alt" label="Alt Text" />
			<NumberField source="coverImage.width" label="Width (px)" />
			<NumberField source="coverImage.height" label="Height (px)" />
			<UrlField source="coverImage.original" label="Original URL" />
			<TextField source="coverImage.blurHash" label="BlurHash" />

			<Divider sx={{ my: 2 }} />
			<Typography variant="subtitle2" color="textSecondary">Timestamps</Typography>

			<DateField source={SERIES_FIELDS.CREATED_AT} label="Created At" showTime />
			<DateField source={SERIES_FIELDS.UPDATED_AT} label="Updated At" showTime />
		</SimpleShowLayout>
	</Show>
)
