import { useEffect, useRef } from 'react'
import {
	Create,
	SimpleForm,
	TextInput,
	BooleanInput,
	SaveButton,
	Toolbar,
	required,
} from 'react-admin'
import { useWatch, useFormContext } from 'react-hook-form'
import { Divider, Typography } from '@mui/material'
import { CONTENT_FIELDS } from '../../types'
import { toSlug } from '../../utils/slugify'
import { ImageUploadInput } from '../../components/ImageUploadInput'

const SlugAutoFillInput = () => {
	const { setValue } = useFormContext()
	const title = useWatch({ name: CONTENT_FIELDS.TITLE }) as string | undefined
	const manuallyEdited = useRef(false)

	useEffect(() => {
		if (!manuallyEdited.current && typeof title === 'string') {
			setValue(CONTENT_FIELDS.SLUG, toSlug(title))
		}
	}, [title, setValue])

	return (
		<TextInput
			source={CONTENT_FIELDS.SLUG}
			label="Slug"
			fullWidth
			onChange={() => { manuallyEdited.current = true }}
			helperText="Auto-filled from title. Override manually (e.g. bio, homepage_hero, statement)."
		/>
	)
}

const ContentsCreateToolbar = () => (
	<Toolbar>
		<SaveButton />
	</Toolbar>
)

const transform = (data: Record<string, unknown>) => ({
	...data,
	slug: data.slug || toSlug(String(data.title ?? '')),
})

export const ContentsCreate = () => (
	<Create title="Create Content" transform={transform}>
		<SimpleForm toolbar={<ContentsCreateToolbar />}>
			<TextInput
				source={CONTENT_FIELDS.TITLE}
				label="Title"
				validate={[required()]}
				fullWidth
			/>
			<SlugAutoFillInput />

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Publication</Typography>

			<BooleanInput
				source={CONTENT_FIELDS.PUBLISHED}
				label="Published"
				defaultValue={false}
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Content</Typography>

			<TextInput
				source={CONTENT_FIELDS.BODY}
				label="Body (HTML)"
				validate={[required()]}
				multiline
				rows={10}
				fullWidth
				helperText="Enter HTML content. Tags like <p>, <strong>, <em>, <a>, <ul> etc. are supported."
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Image (optional)</Typography>

			<ImageUploadInput
				source={CONTENT_FIELDS.IMAGE}
				storagePath="contents"
				label="Image"
			/>
		</SimpleForm>
	</Create>
)
