import { useEffect, useRef } from 'react'
import {
	Create,
	SimpleForm,
	TextInput,
	SelectInput,
	SaveButton,
	Toolbar,
	required,
} from 'react-admin'
import { useWatch, useFormContext } from 'react-hook-form'
import { Divider, Typography } from '@mui/material'
import { TECHNIQUE_FIELDS, TECHNIQUE_CATEGORIES, TECHNIQUE_CATEGORY_LABELS } from '../../types'
import { toSlug } from '../../utils/slugify'

const categoryChoices = TECHNIQUE_CATEGORIES.map(c => ({
	id: c,
	name: TECHNIQUE_CATEGORY_LABELS[c],
}))

const SlugAutoFillInput = () => {
	const { setValue } = useFormContext()
	const name = useWatch({ name: TECHNIQUE_FIELDS.NAME }) as string | undefined
	const manuallyEdited = useRef(false)

	useEffect(() => {
		if (!manuallyEdited.current && typeof name === 'string') {
			setValue(TECHNIQUE_FIELDS.SLUG, toSlug(name))
		}
	}, [name, setValue])

	return (
		<TextInput
			source={TECHNIQUE_FIELDS.SLUG}
			label="Slug"
			fullWidth
			onChange={() => { manuallyEdited.current = true }}
			helperText="Auto-filled from name. Edit to override."
		/>
	)
}

const TechniqueCreateToolbar = () => (
	<Toolbar>
		<SaveButton />
	</Toolbar>
)

const transform = (data: Record<string, unknown>) => ({
	...data,
	slug: data.slug || toSlug(String(data.name ?? '')),
})

export const TechniqueCreate = () => (
	<Create title="Create Technique" transform={transform}>
		<SimpleForm toolbar={<TechniqueCreateToolbar />}>
			<TextInput
				source={TECHNIQUE_FIELDS.NAME}
				label="Name"
				validate={[required()]}
				fullWidth
			/>
			<SlugAutoFillInput />

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Details</Typography>

			<SelectInput
				source={TECHNIQUE_FIELDS.CATEGORY}
				label="Category"
				choices={categoryChoices}
				validate={[required()]}
				fullWidth
			/>
			<TextInput
				source={TECHNIQUE_FIELDS.DESCRIPTION}
				label="Description"
				multiline
				rows={4}
				fullWidth
			/>
		</SimpleForm>
	</Create>
)
