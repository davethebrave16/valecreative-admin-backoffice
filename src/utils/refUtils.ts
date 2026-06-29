import type { DocumentReference } from 'firebase/firestore'

export const isDocRef = (v: unknown): v is DocumentReference =>
	!!v &&
	typeof v === 'object' &&
	typeof (v as Record<string, unknown>).path === 'string' &&
	typeof (v as Record<string, unknown>).id === 'string'

export const refId = (v: unknown): string | undefined => {
	if (!v) return undefined
	if (typeof v === 'string') {
		if (v.startsWith('http://') || v.startsWith('https://')) return undefined
		const parts = v.replace(/^\//, '').split('/')
		return parts.length >= 2 ? parts[parts.length - 1] : v
	}
	if (isDocRef(v)) return v.id
	return undefined
}

export const flattenRefs = (data: unknown): unknown => {
	if (!data || typeof data !== 'object') return data
	const out: Record<string, unknown> = { ...(data as Record<string, unknown>) }
	for (const [k, v] of Object.entries(out)) {
		if (k.endsWith('_ref')) continue
		if (Array.isArray(v)) {
			out[k] = v.map((item: unknown) => flattenRefs(item))
			continue
		}
		const id = refId(v)
		if (id) out[k] = id
	}
	return out
}
