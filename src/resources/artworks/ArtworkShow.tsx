import {
	Show,
	SimpleShowLayout,
	TextField,
	DateField,
	BooleanField,
	NumberField,
	FunctionField,
	ReferenceField,
	ArrayField,
	TopToolbar,
	EditButton,
} from 'react-admin'
import { Divider, Typography, Box } from '@mui/material'
import { ARTWORK_FIELDS } from '../../types'
import type { Artwork, ImageObject } from '../../types'
import { ConfirmDeleteButton } from '../../components/ConfirmDeleteButton'

const ArtworkShowActions = () => (
	<TopToolbar>
		<EditButton />
		<ConfirmDeleteButton />
	</TopToolbar>
)

export const ArtworkShow = () => (
	<Show actions={<ArtworkShowActions />}>
		<SimpleShowLayout>
			<TextField source={ARTWORK_FIELDS.TITLE} label="Title" />
			<TextField source={ARTWORK_FIELDS.SLUG} label="Slug" />
			<NumberField source={ARTWORK_FIELDS.YEAR} label="Year" />

			<ReferenceField source={ARTWORK_FIELDS.TECHNIQUE_ID} reference="techniques" label="Technique">
				<TextField source="name" />
			</ReferenceField>
			<ReferenceField source={ARTWORK_FIELDS.SERIES_ID} reference="series" label="Series" emptyText="—">
				<TextField source="name" />
			</ReferenceField>

			<BooleanField source={ARTWORK_FIELDS.AVAILABLE} label="Available" />
			<NumberField source={ARTWORK_FIELDS.PRICE} label="Price (€)" emptyText="—" />
			<BooleanField source={ARTWORK_FIELDS.FEATURED} label="Featured" />

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
			<Typography variant="subtitle2" color="textSecondary">Images</Typography>

			<ArrayField source={ARTWORK_FIELDS.IMAGES} label="">
				<FunctionField<ImageObject>
					label=""
					render={(image) =>
						image?.original ? (
							<Box sx={{ mb: 2 }}>
								<img
									src={image.original}
									alt={image.alt ?? ''}
									style={{
										maxWidth: 480,
										maxHeight: 320,
										objectFit: 'contain',
										display: 'block',
										borderRadius: 4,
										border: '1px solid #e0e0e0',
									}}
								/>
								{image.width && image.height ? (
									<Typography variant="caption" color="text.secondary">
										{image.width} × {image.height} px — {image.alt}
									</Typography>
								) : null}
							</Box>
						) : null
					}
				/>
			</ArrayField>

			<Divider sx={{ my: 2 }} />
			<Typography variant="subtitle2" color="textSecondary">Image URLs</Typography>

			<FunctionField<Artwork>
				label="Image URLs"
				render={(record) =>
					record.images?.length ? (
						<Box>
							{record.images.map((img, i) => (
								<Box key={i} sx={{ mb: 1 }}>
									<Typography variant="caption" color="text.secondary">Image {i + 1}</Typography>
									<br />
									<a href={img.original} target="_blank" rel="noreferrer" style={{ fontSize: 12, wordBreak: 'break-all' }}>
										{img.original}
									</a>
								</Box>
							))}
						</Box>
					) : null
				}
			/>

			<Divider sx={{ my: 2 }} />
			<Typography variant="subtitle2" color="textSecondary">Timestamps</Typography>

			<DateField source={ARTWORK_FIELDS.CREATED_AT} label="Created At" showTime />
			<DateField source={ARTWORK_FIELDS.UPDATED_AT} label="Updated At" showTime />
		</SimpleShowLayout>
	</Show>
)
