import { useEffect, useRef } from 'react'
import {
	Create,
	SimpleForm,
	TextInput,
	NumberInput,
	BooleanInput,
	SaveButton,
	Toolbar,
	required,
} from 'react-admin'
import { useWatch, useFormContext } from 'react-hook-form'
import { Divider, Typography } from '@mui/material'
import { SERIES_FIELDS } from '../../types'
import { toSlug } from '../../utils/slugify'

const SlugAutoFillInput = () => {
	const { setValue } = useFormContext()
	const name = useWatch({ name: SERIES_FIELDS.NAME }) as string | undefined
	const manuallyEdited = useRef(false)

	useEffect(() => {
		if (!manuallyEdited.current && typeof name === 'string') {
			setValue(SERIES_FIELDS.SLUG, toSlug(name))
		}
	}, [name, setValue])

	return (
		<TextInput
			source={SERIES_FIELDS.SLUG}
			label="Slug"
			fullWidth
			onChange={() => { manuallyEdited.current = true }}
			helperText="Auto-filled from name. Edit to override."
		/>
	)
}

const SeriesCreateToolbar = () => (
	<Toolbar>
		<SaveButton />
	</Toolbar>
)

const transform = (data: Record<string, unknown>) => ({
	...data,
	slug: data.slug || toSlug(String(data.name ?? '')),
})

export const SeriesCreate = () => (
	<Create title="Create Series" transform={transform}>
		<SimpleForm toolbar={<SeriesCreateToolbar />}>
			<TextInput
				source={SERIES_FIELDS.NAME}
				label="Name"
				validate={[required()]}
				fullWidth
			/>
			<SlugAutoFillInput />

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Publication</Typography>

			<BooleanInput
				source={SERIES_FIELDS.PUBLISHED}
				label="Published"
				defaultValue={false}
			/>
			<NumberInput
				source={SERIES_FIELDS.ORDER}
				label="Order"
				defaultValue={0}
				helperText="Lower numbers appear first."
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Description</Typography>

			<TextInput
				source={SERIES_FIELDS.DESCRIPTION}
				label="Description"
				multiline
				rows={4}
				fullWidth
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Cover Image</Typography>

			<TextInput
				source="coverImage.original"
				label="Original URL"
				fullWidth
				helperText="Firebase Storage download URL for the full-resolution image."
			/>
			<TextInput
				source="coverImage.alt"
				label="Alt Text"
				fullWidth
			/>
			<NumberInput
				source="coverImage.width"
				label="Width (px)"
				sx={{ mr: 2 }}
			/>
			<NumberInput
				source="coverImage.height"
				label="Height (px)"
			/>
			<TextInput
				source="coverImage.blurHash"
				label="BlurHash"
				fullWidth
			/>
		</SimpleForm>
	</Create>
)
