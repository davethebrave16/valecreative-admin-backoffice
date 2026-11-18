import { useRecordContext } from 'react-admin'
import { Link, Stack } from '@mui/material'

interface PhoneFieldProps {
	source: string
	label?: string
}

// Renders nothing when the record has no phone (old commissions don't).
// The WhatsApp link is only offered for numbers with an international "+" prefix.
export const PhoneField = ({ source }: PhoneFieldProps) => {
	const record = useRecordContext<Record<string, unknown>>()
	const raw = record?.[source]
	if (typeof raw !== 'string' || !raw.trim()) return null

	const phone = raw.trim()
	const digits = phone.replace(/\D/g, '')
	const hasInternationalPrefix = phone.startsWith('+')
	const telHref = `tel:${hasInternationalPrefix ? '+' : ''}${digits}`

	return (
		<Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
			<Link href={telHref}>{phone}</Link>
			{hasInternationalPrefix && (
				<Link href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">
					WhatsApp
				</Link>
			)}
		</Stack>
	)
}
