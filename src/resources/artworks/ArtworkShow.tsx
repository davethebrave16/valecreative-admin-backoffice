import {
	Show,
	TabbedShowLayout,
	TextField,
	DateField,
	NumberField,
	FunctionField,
	ReferenceField,
	TopToolbar,
	EditButton,
} from 'react-admin'
import { Divider, Typography, Box } from '@mui/material'
import { ARTWORK_FIELDS } from '../../types'
import type { Artwork } from '../../types'
import { ConfirmDeleteButton } from '../../components/ConfirmDeleteButton'
import { GalleryTab } from './GalleryTab'

const ArtworkShowActions = () => (
	<TopToolbar>
		<EditButton />
		<ConfirmDeleteButton />
	</TopToolbar>
)

export const ArtworkShow = () => (
	<Show actions={<ArtworkShowActions />}>
		<TabbedShowLayout>
			<TabbedShowLayout.Tab label="Details">
				<TextField source={ARTWORK_FIELDS.TITLE} label="Title" />
				<TextField source={ARTWORK_FIELDS.SLUG} label="Slug" />
				<NumberField source={ARTWORK_FIELDS.YEAR} label="Year" />

				<ReferenceField source={ARTWORK_FIELDS.TECHNIQUE_ID} reference="techniques" label="Technique">
					<TextField source="name" />
				</ReferenceField>
				<ReferenceField source={ARTWORK_FIELDS.SERIES_ID} reference="series" label="Series" emptyText="—">
					<TextField source="name" />
				</ReferenceField>

				<TextField source={ARTWORK_FIELDS.ORIGIN} label="Origin" />
				<TextField source={ARTWORK_FIELDS.AVAILABILITY} label="Availability" />
				<NumberField source={ARTWORK_FIELDS.PRICE} label="Price (€)" emptyText="—" />
				<TextField source={ARTWORK_FIELDS.FEATURED} label="Featured" />

				<Divider sx={{ my: 2 }} />
				<Typography variant="subtitle2" color="textSecondary">Dimensions & Support</Typography>

				<FunctionField<Artwork>
					label="Dimensions"
					render={(record) =>
						record.dimensions
							? `${record.dimensions.height} × ${record.dimensions.width} ${record.dimensions.unit}`
							: '—'
					}
				/>
				<TextField source={ARTWORK_FIELDS.SUPPORT} label="Support" />
				<TextField source={ARTWORK_FIELDS.DESCRIPTION} label="Description" />

				<Divider sx={{ my: 2 }} />
				<Typography variant="subtitle2" color="textSecondary">Cover Image</Typography>

				<FunctionField<Artwork>
					label="Preview"
					render={(record) =>
						record.coverImage?.original ? (
							<Box>
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
								{record.coverImage.width && record.coverImage.height ? (
									<Typography variant="caption" color="text.secondary">
										{record.coverImage.width} × {record.coverImage.height} px
									</Typography>
								) : null}
							</Box>
						) : null
					}
				/>
				<TextField source="coverImage.alt" label="Alt Text" />
				<TextField source="coverImage.blurHash" label="BlurHash" />

				<Divider sx={{ my: 2 }} />
				<Typography variant="subtitle2" color="textSecondary">Timestamps</Typography>

				<DateField source={ARTWORK_FIELDS.CREATED_AT} label="Created At" showTime />
				<DateField source={ARTWORK_FIELDS.UPDATED_AT} label="Updated At" showTime />
			</TabbedShowLayout.Tab>

			<TabbedShowLayout.Tab label="Gallery">
				<GalleryTab />
			</TabbedShowLayout.Tab>
		</TabbedShowLayout>
	</Show>
)
