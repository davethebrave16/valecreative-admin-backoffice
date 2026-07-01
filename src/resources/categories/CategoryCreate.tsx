import { useEffect, useRef } from 'react'
import {
	Create,
	SimpleForm,
	TextInput,
	SaveButton,
	Toolbar,
	required,
} from 'react-admin'
import { useWatch, useFormContext } from 'react-hook-form'
import { CATEGORY_FIELDS } from '../../types'
import { toSlug } from '../../utils/slugify'

const SlugAutoFillInput = () => {
	const { setValue } = useFormContext()
	const name = useWatch({ name: CATEGORY_FIELDS.NAME }) as string | undefined
	const manuallyEdited = useRef(false)

	useEffect(() => {
		if (!manuallyEdited.current && typeof name === 'string') {
			setValue(CATEGORY_FIELDS.SLUG, toSlug(name))
		}
	}, [name, setValue])

	return (
		<TextInput
			source={CATEGORY_FIELDS.SLUG}
			label="Slug"
			fullWidth
			onChange={() => { manuallyEdited.current = true }}
			helperText="Auto-filled from name. Edit to override."
		/>
	)
}

const CategoryCreateToolbar = () => (
	<Toolbar>
		<SaveButton />
	</Toolbar>
)

const transform = (data: Record<string, unknown>) => ({
	...data,
	slug: data.slug || toSlug(String(data.name ?? '')),
})

export const CategoryCreate = () => (
	<Create title="Create Category" transform={transform}>
		<SimpleForm toolbar={<CategoryCreateToolbar />}>
			<TextInput
				source={CATEGORY_FIELDS.NAME}
				label="Name"
				validate={[required()]}
				fullWidth
			/>
			<SlugAutoFillInput />
		</SimpleForm>
	</Create>
)
