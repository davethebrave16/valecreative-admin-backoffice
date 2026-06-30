import {
	Show,
	SimpleShowLayout,
	TextField,
	DateField,
	BooleanField,
	UrlField,
	NumberField,
	FunctionField,
	TopToolbar,
	EditButton,
	useRecordContext,
} from 'react-admin'
import { Divider, Typography } from '@mui/material'
import { CONTENT_FIELDS } from '../../types'
import type { Content } from '../../types'
import { ConfirmDeleteButton } from '../../components/ConfirmDeleteButton'

const ContentsShowActions = () => {
	const record = useRecordContext<Content>()
	return (
		<TopToolbar>
			<EditButton />
			{record && !record.published && <ConfirmDeleteButton />}
		</TopToolbar>
	)
}

export const ContentsShow = () => (
	<Show actions={<ContentsShowActions />}>
		<SimpleShowLayout>
			<TextField source={CONTENT_FIELDS.SLUG} label="Slug" />
			<TextField source={CONTENT_FIELDS.TITLE} label="Title" />
			<BooleanField source={CONTENT_FIELDS.PUBLISHED} label="Published" />

			<Divider sx={{ my: 2 }} />
			<Typography variant="subtitle2" color="textSecondary">Content</Typography>

			<FunctionField<Content>
				label="Body"
				render={(record) =>
					record.body ? (
						<div
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={{ __html: record.body }}
							style={{ maxWidth: 720, lineHeight: 1.6 }}
						/>
					) : null
				}
			/>

			<Divider sx={{ my: 2 }} />
			<Typography variant="subtitle2" color="textSecondary">Image</Typography>

			<FunctionField<Content>
				label="Preview"
				render={(record) =>
					record.image?.original ? (
						<img
							src={record.image.original}
							alt={record.image.alt ?? ''}
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
			<TextField source="image.alt" label="Alt Text" />
			<NumberField source="image.width" label="Width (px)" />
			<NumberField source="image.height" label="Height (px)" />
			<UrlField source="image.original" label="Original URL" />
			<TextField source="image.blurHash" label="BlurHash" />

			<Divider sx={{ my: 2 }} />
			<Typography variant="subtitle2" color="textSecondary">Timestamps</Typography>

			<DateField source={CONTENT_FIELDS.CREATED_AT} label="Created At" showTime />
			<DateField source={CONTENT_FIELDS.UPDATED_AT} label="Updated At" showTime />
		</SimpleShowLayout>
	</Show>
)
