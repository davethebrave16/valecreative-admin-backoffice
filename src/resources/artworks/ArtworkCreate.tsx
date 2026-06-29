import { useEffect, useRef } from 'react'
import {
	Create,
	SimpleForm,
	TextInput,
	NumberInput,
	BooleanInput,
	ReferenceInput,
	SelectInput,
	SaveButton,
	Toolbar,
	required,
} from 'react-admin'
import { useWatch, useFormContext } from 'react-hook-form'
import { Divider, Typography } from '@mui/material'
import { ARTWORK_FIELDS } from '../../types'
import { toSlug } from '../../utils/slugify'
import { ArtworkImagesInput } from './ArtworkImagesInput'

const SlugAutoFillInput = () => {
	const { setValue } = useFormContext()
	const title = useWatch({ name: ARTWORK_FIELDS.TITLE }) as string | undefined
	const manuallyEdited = useRef(false)

	useEffect(() => {
		if (!manuallyEdited.current && typeof title === 'string') {
			setValue(ARTWORK_FIELDS.SLUG, toSlug(title))
		}
	}, [title, setValue])

	return (
		<TextInput
			source={ARTWORK_FIELDS.SLUG}
			label="Slug"
			fullWidth
			onChange={() => { manuallyEdited.current = true }}
			helperText="Auto-filled from title. Edit to override."
		/>
	)
}

const ArtworkCreateToolbar = () => (
	<Toolbar>
		<SaveButton />
	</Toolbar>
)

const transform = (data: Record<string, unknown>) => ({
	...data,
	slug: data.slug || toSlug(String(data.title ?? '')),
})

export const ArtworkCreate = () => (
	<Create title="Create Artwork" transform={transform}>
		<SimpleForm toolbar={<ArtworkCreateToolbar />}>
			<TextInput
				source={ARTWORK_FIELDS.TITLE}
				label="Title"
				validate={[required()]}
				fullWidth
			/>
			<SlugAutoFillInput />
			<NumberInput
				source={ARTWORK_FIELDS.YEAR}
				label="Year"
				validate={[required()]}
				defaultValue={new Date().getFullYear()}
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Classification</Typography>

			<ReferenceInput source={ARTWORK_FIELDS.TECHNIQUE_ID} reference="techniques">
				<SelectInput
					label="Technique"
					optionText="name"
					validate={[required()]}
					fullWidth
				/>
			</ReferenceInput>
			<ReferenceInput source={ARTWORK_FIELDS.SERIES_ID} reference="series">
				<SelectInput
					label="Series"
					optionText="name"
					fullWidth
					emptyText="— None —"
				/>
			</ReferenceInput>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Availability</Typography>

			<BooleanInput
				source={ARTWORK_FIELDS.AVAILABLE}
				label="Available"
				defaultValue={true}
			/>
			<NumberInput
				source={ARTWORK_FIELDS.PRICE}
				label="Price (€)"
				helperText="Leave empty if not for sale."
			/>
			<BooleanInput
				source={ARTWORK_FIELDS.FEATURED}
				label="Featured"
				defaultValue={false}
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Dimensions & Support</Typography>

			<NumberInput
				source={ARTWORK_FIELDS.DIMENSIONS_HEIGHT}
				label="Height"
				helperText="Height in the unit specified below."
			/>
			<NumberInput
				source={ARTWORK_FIELDS.DIMENSIONS_WIDTH}
				label="Width"
				helperText="Width in the unit specified below."
			/>
			<TextInput
				source={ARTWORK_FIELDS.DIMENSIONS_UNIT}
				label="Unit"
				defaultValue="cm"
				helperText="e.g. cm, mm, in"
			/>
			<TextInput
				source={ARTWORK_FIELDS.SUPPORT}
				label="Support"
				fullWidth
				helperText="e.g. canvas, wood panel, paper"
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Description</Typography>

			<TextInput
				source={ARTWORK_FIELDS.DESCRIPTION}
				label="Description"
				multiline
				rows={4}
				fullWidth
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Images</Typography>

			<ArtworkImagesInput source={ARTWORK_FIELDS.IMAGES} storagePath="artworks" />
		</SimpleForm>
	</Create>
)
