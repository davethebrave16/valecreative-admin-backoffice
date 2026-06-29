const isTimestamp = (v: unknown): boolean =>
	!!v &&
	typeof v === 'object' &&
	typeof (v as Record<string, unknown>).seconds === 'number'

const normalizeDateValue = (v: unknown): unknown => {
	if (isTimestamp(v)) return (v as { seconds: number }).seconds * 1000
	if (v instanceof Date) return v.getTime()
	return v
}

export const normalizeDateFields = (obj: unknown): unknown => {
	if (!obj || typeof obj !== 'object') return obj
	const normalized: Record<string, unknown> = { ...(obj as Record<string, unknown>) }
	for (const [key, value] of Object.entries(normalized)) {
		normalized[key] = normalizeDateValue(value)
	}
	return normalized
}
