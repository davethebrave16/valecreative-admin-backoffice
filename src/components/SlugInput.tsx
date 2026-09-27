import { useEffect, useRef } from 'react'
import { TextInput, regex, required, useRecordContext } from 'react-admin'
import { useFormContext, useWatch } from 'react-hook-form'
import { Alert } from '@mui/material'
import { CONTENT_SLUG_PATTERN, SLUG_PATTERN, toSlug } from '../utils/slugify'

const slugValidator = (allowUnderscore: boolean) =>
	allowUnderscore
		? regex(CONTENT_SLUG_PATTERN, 'Solo lettere minuscole, numeri, trattini o underscore (es. homepage_hero)')
		: regex(SLUG_PATTERN, 'Solo lettere minuscole, numeri e trattini (es. la-compagnia-dellanello)')

interface SlugAutoFillInputProps {
	source: string
	// Field the slug is generated from (title/name) until the admin edits the slug by hand.
	fromSource: string
	// `contents` slugs are lookup keys (e.g. homepage_hero), not URLs: underscores allowed.
	allowUnderscore?: boolean
	helperText?: string
}

// Create forms: auto-fill from the title/name. Empty is allowed here — the Create `transform` falls back to toSlug(title).
export const SlugAutoFillInput = ({
	source,
	fromSource,
	allowUnderscore = false,
	helperText = 'Auto-filled from the title. Edit to override.',
}: SlugAutoFillInputProps) => {
	const { setValue } = useFormContext()
	const from = useWatch({ name: fromSource }) as string | undefined
	const manuallyEdited = useRef(false)

	useEffect(() => {
		if (!manuallyEdited.current && typeof from === 'string') {
			setValue(source, toSlug(from))
		}
	}, [from, source, setValue])

	return (
		<TextInput
			source={source}
			label="Slug"
			fullWidth
			validate={[slugValidator(allowUnderscore)]}
			onChange={() => { manuallyEdited.current = true }}
			helperText={helperText}
		/>
	)
}

interface SlugEditInputProps {
	source: string
	allowUnderscore?: boolean
}

// Edit forms: same format rules, plus a warning as soon as the slug differs from the saved one.
export const SlugEditInput = ({ source, allowUnderscore = false }: SlugEditInputProps) => {
	const record = useRecordContext()
	const current = useWatch({ name: source }) as string | undefined
	const original = record?.[source] as string | undefined
	const isChanged = original !== undefined && current !== original

	return (
		<>
			<TextInput
				source={source}
				label="Slug"
				fullWidth
				validate={[required(), slugValidator(allowUnderscore)]}
			/>
			{isChanged && (
				<Alert severity="warning" sx={{ mb: 2, width: '100%' }}>
					Cambiare lo slug cambia l'indirizzo della pagina: i link già condivisi smetteranno di funzionare senza un redirect
				</Alert>
			)}
		</>
	)
}
