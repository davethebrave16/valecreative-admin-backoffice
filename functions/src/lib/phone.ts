const PHONE_ALLOWED_CHARS = /^\+?[\d\s\-.()]+$/
const PHONE_MAX_RAW_LENGTH = 40
const PHONE_MIN_DIGITS = 6
const PHONE_MAX_DIGITS = 20

export type PhoneResult = { ok: true; value?: string } | { ok: false }

// Permissive phone check: optional leading "+", digits, spaces, dashes, dots, parentheses; 6-20 digits.
// Blank/absent => ok with no value (the field is optional). Callers must never log the value.
export const normalizePhone = (raw: unknown): PhoneResult => {
	if (raw === undefined || raw === null) return { ok: true }
	if (typeof raw !== 'string') return { ok: false }

	const trimmed = raw.trim()
	if (!trimmed) return { ok: true }
	if (trimmed.length > PHONE_MAX_RAW_LENGTH) return { ok: false }
	if (!PHONE_ALLOWED_CHARS.test(trimmed)) return { ok: false }

	const digits = trimmed.replace(/\D/g, '')
	if (digits.length < PHONE_MIN_DIGITS || digits.length > PHONE_MAX_DIGITS) return { ok: false }

	return { ok: true, value: trimmed.replace(/\s+/g, ' ') }
}
