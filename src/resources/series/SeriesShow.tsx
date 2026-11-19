import {
	Show,
	SimpleShowLayout,
	TextField,
	DateField,
	BooleanField,
	NumberField,
	TopToolbar,
	EditButton,
} from 'react-admin'
import { Divider, Typography } from '@mui/material'
import { SERIES_FIELDS } from '../../types'
import { FeaturedArtworkPreview } from '../../components/FeaturedArtworkPicker'
import { ManageSeriesArtworksButton } from '../../components/ManageSeriesArtworksButton'
import { GuardedDeleteButton } from '../../components/GuardedDeleteButton'

const SeriesShowActions = () => (
	<TopToolbar>
		<ManageSeriesArtworksButton />
		<EditButton />
		<GuardedDeleteButton checkField="seriesId" resourceLabel="series" />
	</TopToolbar>
)

export const SeriesShow = () => (
	<Show actions={<SeriesShowActions />}>
		<SimpleShowLayout>
			<TextField source={SERIES_FIELDS.NAME} label="Name" />
			<TextField source={SERIES_FIELDS.SLUG} label="Slug" />
			<BooleanField source={SERIES_FIELDS.PUBLISHED} label="Published" />
			<NumberField source={SERIES_FIELDS.ORDER} label="Order" />
			<TextField source={SERIES_FIELDS.DESCRIPTION} label="Short description" />

			<TextField source={SERIES_FIELDS.INTRO} label="Introduction" sx={{ whiteSpace: 'pre-line' }} />

			<Divider sx={{ my: 2 }} />
			<Typography variant="subtitle2" color="textSecondary">Featured Artwork (series cover)</Typography>
			<FeaturedArtworkPreview size="large" />

			<Divider sx={{ my: 2 }} />
			<Typography variant="subtitle2" color="textSecondary">English</Typography>

			<TextField source={SERIES_FIELDS.NAME_EN} label="Name (English)" emptyText="—" />
			<TextField source={SERIES_FIELDS.DESCRIPTION_EN} label="Short description (English)" emptyText="—" />
			<TextField source={SERIES_FIELDS.INTRO_EN} label="Introduction (English)" emptyText="—" sx={{ whiteSpace: 'pre-line' }} />

			<Divider sx={{ my: 2 }} />
			<Typography variant="subtitle2" color="textSecondary">Timestamps</Typography>

			<DateField source={SERIES_FIELDS.CREATED_AT} label="Created At" showTime />
			<DateField source={SERIES_FIELDS.UPDATED_AT} label="Updated At" showTime />
		</SimpleShowLayout>
	</Show>
)
