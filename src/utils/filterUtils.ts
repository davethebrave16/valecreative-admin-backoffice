import { isDocRef } from './refUtils'

// Stub: no reference fields yet. Expand per-resource as artworks/series are added.
export const normalizeReferenceValue = (
	_fieldName: string,
	fieldValue: unknown,
	_collection?: string,
): unknown => {
	if (isDocRef(fieldValue)) return fieldValue
	return fieldValue
}
