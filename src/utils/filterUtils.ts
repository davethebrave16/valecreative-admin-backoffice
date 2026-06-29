import { doc } from 'firebase/firestore'
import { db } from '../firebase'
import { isDocRef } from './refUtils'

export const normalizeReferenceValue = (
	fieldName: string,
	fieldValue: unknown,
	_collection?: string,
): unknown => {
	if (isDocRef(fieldValue)) return fieldValue
	if (typeof fieldValue !== 'string' || !fieldValue) return fieldValue

	if (fieldName === 'techniqueId') return doc(db, 'techniques', fieldValue)
	if (fieldName === 'seriesId') return doc(db, 'series', fieldValue)

	return fieldValue
}
