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
import { Divider, Typography } from '@mui/material'
import { SERIES_FIELDS } from '../../types'
import { toSlug } from '../../utils/slugify'
import { SlugAutoFillInput } from '../../components/SlugInput'

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
			<SlugAutoFillInput source={SERIES_FIELDS.SLUG} fromSource={SERIES_FIELDS.NAME} />

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
				label="Short description"
				helperText="Short text used on cards, in the page hero and as meta description (aim for under 160 characters)."
				multiline
				rows={3}
				fullWidth
			/>
			<TextInput
				source={SERIES_FIELDS.INTRO}
				label="Introduction"
				helperText="Long introductory text for the series page. Separate paragraphs with a blank line. Put any notice (e.g. fan art disclaimer) as the last paragraph."
				multiline
				rows={8}
				fullWidth
			/>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">English (optional)</Typography>

			<TextInput
				source={SERIES_FIELDS.NAME_EN}
				label="Name (English)"
				fullWidth
			/>
			<TextInput
				source={SERIES_FIELDS.DESCRIPTION_EN}
				label="Short description (English)"
				multiline
				rows={3}
				fullWidth
			/>
			<TextInput
				source={SERIES_FIELDS.INTRO_EN}
				label="Introduction (English)"
				multiline
				rows={8}
				fullWidth
			/>
		</SimpleForm>
	</Create>
)
