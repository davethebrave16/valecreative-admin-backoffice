/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DataProvider } from 'react-admin'
import {
	collection,
	query,
	getDocs,
	doc,
	getDoc,
	orderBy,
	startAfter,
	limit,
	getCountFromServer,
	where,
	addDoc,
	setDoc,
	updateDoc,
	deleteDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { debugLog, debugError, debugQuery, debugResult } from '../utils/debugLogger'
import { getStorageFolderPath, deleteStorageFolder } from '../utils/storageUtils'
import { isDocRef, refId, flattenRefs } from '../utils/refUtils'
import { normalizeDateFields } from '../utils/dateUtils'
import { normalizeReferenceValue } from '../utils/filterUtils'
import { getCurrentAdminEmail } from '../utils/authUtils'

function stripUndefined(obj: Record<string, any>): Record<string, any> {
	const result: Record<string, any> = {}
	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined) result[key] = value
	}
	return result
}

interface SubcollectionMeta {
	parentResource?: string
	parentId?: string
	grandparentResource?: string
	grandparentId?: string
}

function getCollectionPath(resource: string, meta?: SubcollectionMeta): string {
	if (meta?.parentResource && meta?.parentId) {
		if (meta?.grandparentResource && meta?.grandparentId) {
			return `${meta.parentResource}/${meta.parentId}/${meta.grandparentResource}/${meta.grandparentId}/${resource}`
		}
		return `${meta.parentResource}/${meta.parentId}/${resource}`
	}
	return resource
}

export const dataProvider: DataProvider = {
	getList: async (resource, params) => {
		try {
			const { page = 1, perPage = 10 } = params.pagination ?? {}
			const { field, order } = params.sort ?? {}
			const filters = params.filter ?? {}
			const meta = params.meta as SubcollectionMeta | undefined
			const pageNumber = Math.max(1, page)
			const pageSize = Math.max(1, perPage)

			const collectionPath = getCollectionPath(resource, meta)
			debugQuery(collectionPath, 'getList', { filters, pagination: { page: pageNumber, perPage: pageSize }, sort: { field, order } })

			const colRef = collection(db, collectionPath)

			const whereConds: any[] = []
			let hasRangeCondition = false

			for (const [fieldName, fieldValue] of Object.entries(filters)) {
				if (fieldValue === undefined || fieldValue === null || fieldValue === '') continue

				if (
					fieldName.includes('time') ||
					fieldName.includes('date') ||
					fieldName.includes('created') ||
					fieldName.includes('updated') ||
					fieldName.endsWith('At')
				) {
					try {
						if (typeof fieldValue === 'string' || typeof fieldValue === 'number' || fieldValue instanceof Date) {
							const d = new Date(fieldValue as any)
							if (!isNaN(d.getTime())) {
								const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
								const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
								whereConds.push(where(fieldName, '>=', start))
								whereConds.push(where(fieldName, '<', end))
								hasRangeCondition = true
								continue
							}
						}
					} catch {
						// fall through to exact match
					}
				}

				const normalized = normalizeReferenceValue(fieldName, fieldValue, resource)
				if (normalized !== fieldValue && isDocRef(normalized)) {
					debugLog(`Reference normalized for filter: ${fieldName} -> "${(normalized as any).path}"`)
				}
				whereConds.push(where(fieldName, '==', normalized))
			}

			debugLog(`Where conditions count: ${whereConds.length}`)

			const sortField = field && field !== 'id' ? field : 'createdAt'
			const sortOrder: 'asc' | 'desc' = order === 'DESC' ? 'desc' : 'asc'
			const applySort = hasRangeCondition && !!(field && field !== 'id')

			const totalQuery =
				whereConds.length > 0 && applySort
					? query(colRef, ...whereConds, orderBy(sortField, sortOrder))
					: whereConds.length > 0
						? query(colRef, ...whereConds)
						: colRef
			const totalSnap = await getCountFromServer(totalQuery)
			const total = totalSnap.data().count

			debugResult(resource, 'getList', total)

			const baseQuery =
				whereConds.length > 0 && applySort
					? query(colRef, ...whereConds, orderBy(sortField, sortOrder))
					: whereConds.length > 0
						? query(colRef, ...whereConds)
						: query(colRef, orderBy(sortField, sortOrder))

			if (pageNumber === 1) {
				const snap = await getDocs(query(baseQuery, limit(pageSize)))
				const data = snap.docs.map(d => ({
					id: d.id,
					...(normalizeDateFields(flattenRefs(d.data())) as any),
				}))
				return { data: data as any[], total }
			}

			const offsetCount = (pageNumber - 1) * pageSize
			const cursorSnap = await getDocs(query(baseQuery, limit(offsetCount)))
			const last = cursorSnap.docs[cursorSnap.docs.length - 1]
			if (!last) return { data: [], total }

			const pageSnap = await getDocs(query(baseQuery, startAfter(last), limit(pageSize)))
			const data = pageSnap.docs.map(d => ({
				id: d.id,
				...(normalizeDateFields(flattenRefs(d.data())) as any),
			}))
			return { data: data as any[], total }
		} catch (error) {
			debugError('getList error', error)
			throw error
		}
	},

	getOne: async (resource, params) => {
		try {
			const meta = params.meta as SubcollectionMeta | undefined
			const collectionPath = getCollectionPath(resource, meta)
			const ref = doc(db, collectionPath, String(params.id))
			const snap = await getDoc(ref)
			if (!snap.exists()) throw new Error('Document not found')
			return {
				data: {
					id: snap.id,
					...(normalizeDateFields(flattenRefs(snap.data())) as any),
				},
			}
		} catch (error) {
			console.error('getOne error:', error)
			throw error
		}
	},

	getMany: async (resource, params) => {
		try {
			const { ids } = params
			const normIds = ids.map(i => refId(i) ?? String(i))
			const snaps = await Promise.all(normIds.map(i => getDoc(doc(db, resource, i))))
			const data = snaps
				.filter(s => s.exists())
				.map(s => ({ id: s.id, ...(normalizeDateFields(flattenRefs(s.data())) as any) }))
			return { data: data as any[] }
		} catch (error) {
			debugError('getMany error', error)
			throw error
		}
	},

	getManyReference: async (resource, params) => {
		try {
			const { target, id } = params
			const { page = 1, perPage = 10 } = params.pagination ?? {}
			const pageNumber = Math.max(1, page)
			const pageSize = Math.max(1, perPage)

			debugQuery(resource, 'getManyReference', { target, id, pagination: { page: pageNumber, perPage: pageSize } })

			const colRef = collection(db, resource)
			const normalizedTargetValue = normalizeReferenceValue(target, id, resource)
			const whereCondition = where(target, '==', normalizedTargetValue)

			const totalSnap = await getCountFromServer(query(colRef, whereCondition))
			const total = totalSnap.data().count

			debugResult(resource, 'getManyReference', total)

			const baseQuery = query(colRef, whereCondition)

			if (pageNumber === 1) {
				const snap = await getDocs(query(baseQuery, limit(pageSize)))
				const data = snap.docs.map(d => ({
					id: d.id,
					...(normalizeDateFields(flattenRefs(d.data())) as any),
				}))
				return { data: data as any[], total }
			}

			const offsetCount = (pageNumber - 1) * pageSize
			const cursorSnap = await getDocs(query(baseQuery, limit(offsetCount)))
			const last = cursorSnap.docs[cursorSnap.docs.length - 1]
			if (!last) return { data: [], total }

			const pageSnap = await getDocs(query(baseQuery, startAfter(last), limit(pageSize)))
			const data = pageSnap.docs.map(d => ({
				id: d.id,
				...(normalizeDateFields(flattenRefs(d.data())) as any),
			}))
			return { data: data as any[], total }
		} catch (error) {
			debugError('getManyReference error', error)
			throw error
		}
	},

	create: async (resource, params) => {
		try {
			const { data } = params
			const meta = params.meta as SubcollectionMeta | undefined
			const collectionPath = getCollectionPath(resource, meta)
			debugQuery(collectionPath, 'create', { data })

			const colRef = collection(db, collectionPath)

			const normalizedData: Record<string, any> = {}
			for (const [fieldName, fieldValue] of Object.entries(data)) {
				normalizedData[fieldName] = normalizeReferenceValue(fieldName, fieldValue, resource)
			}

			const dataWithTimestamp = stripUndefined({
				...normalizedData,
				createdAt: normalizedData.createdAt || new Date(),
				createdByAdmin: getCurrentAdminEmail(),
			})

			if (normalizedData.uid) {
				const docRef = doc(db, collectionPath, normalizedData.uid)
				await setDoc(docRef, dataWithTimestamp)
				debugLog(`Created document with custom ID: ${normalizedData.uid}`)
				return { data: { id: normalizedData.uid, ...(normalizeDateFields(flattenRefs(dataWithTimestamp)) as any) } as any }
			} else {
				const docRef = await addDoc(colRef, dataWithTimestamp)
				debugLog(`Created document with auto-generated ID: ${docRef.id}`)
				return { data: { id: docRef.id, ...(normalizeDateFields(flattenRefs(dataWithTimestamp)) as any) } as any }
			}
		} catch (error) {
			debugError('create error', error)
			throw error
		}
	},

	update: async (resource, params) => {
		try {
			const { id, data } = params
			const meta = params.meta as SubcollectionMeta | undefined
			const collectionPath = getCollectionPath(resource, meta)
			debugQuery(collectionPath, 'update', { id, data })

			const docRef = doc(db, collectionPath, String(id))

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { id: _id, uid, createdAt, ...updateData } = data as any

			const normalizedData: Record<string, any> = {}
			for (const [fieldName, fieldValue] of Object.entries(updateData)) {
				normalizedData[fieldName] = normalizeReferenceValue(fieldName, fieldValue, resource)
			}

			const dataWithTimestamp = stripUndefined({
				...normalizedData,
				updatedAt: new Date(),
				updatedByAdmin: getCurrentAdminEmail(),
			})

			await updateDoc(docRef, dataWithTimestamp)
			debugLog(`Updated document: ${id}`)

			const updatedDoc = await getDoc(docRef)
			return {
				data: {
					id: updatedDoc.id,
					...(flattenRefs(updatedDoc.data()) as any),
				} as any,
			}
		} catch (error) {
			debugError('update error', error)
			throw error
		}
	},

	updateMany: async () => {
		throw new Error('UpdateMany not implemented')
	},

	delete: async (resource, params) => {
		try {
			const { id } = params
			const meta = params.meta as SubcollectionMeta | undefined
			const collectionPath = getCollectionPath(resource, meta)
			debugQuery(collectionPath, 'delete', { id })

			await deleteDoc(doc(db, collectionPath, String(id)))
			debugLog(`Deleted document: ${id}`)

			// Clean up Firebase Storage files (best-effort, errors don't fail the delete)
			const prev = params.previousData as any
			if (resource === 'series') {
				const folderPath = prev?.coverImage?.original ? getStorageFolderPath(prev.coverImage.original) : null
				if (folderPath) deleteStorageFolder(folderPath)
			} else if (resource === 'artworks') {
				const folderPath = prev?.coverImage?.original ? getStorageFolderPath(prev.coverImage.original) : null
				if (folderPath) deleteStorageFolder(folderPath)
				// Delete gallery subcollection docs and their storage files
				const gallerySnap = await getDocs(collection(db, `artworks/${String(id)}/gallery`))
				await Promise.all(gallerySnap.docs.map(async (galleryDoc) => {
					const galleryPath = getStorageFolderPath(galleryDoc.data().original ?? '')
					if (galleryPath) await deleteStorageFolder(galleryPath)
					await deleteDoc(galleryDoc.ref)
				}))
			} else if (resource === 'gallery') {
				const folderPath = prev?.original ? getStorageFolderPath(prev.original) : null
				if (folderPath) deleteStorageFolder(folderPath)
			} else if (resource === 'contents') {
				const folderPath = prev?.image?.original ? getStorageFolderPath(prev.image.original) : null
				if (folderPath) deleteStorageFolder(folderPath)
			}

			return { data: { id } as any }
		} catch (error) {
			debugError('delete error', error)
			throw error
		}
	},

	deleteMany: async (resource, params) => {
		try {
			const { ids } = params
			debugQuery(resource, 'deleteMany', { ids })

			await Promise.all(ids.map(async (id) => {
				if (resource === 'series') {
					const snap = await getDoc(doc(db, resource, String(id)))
					const data = snap.data() as any
					const folderPath = data?.coverImage?.original ? getStorageFolderPath(data.coverImage.original) : null
					if (folderPath) await deleteStorageFolder(folderPath)
				} else if (resource === 'artworks') {
					const snap = await getDoc(doc(db, resource, String(id)))
					const data = snap.data() as any
					const folderPath = data?.coverImage?.original ? getStorageFolderPath(data.coverImage.original) : null
					if (folderPath) await deleteStorageFolder(folderPath)
					const gallerySnap = await getDocs(collection(db, `artworks/${String(id)}/gallery`))
					await Promise.all(gallerySnap.docs.map(async (galleryDoc) => {
						const galleryPath = getStorageFolderPath(galleryDoc.data().original ?? '')
						if (galleryPath) await deleteStorageFolder(galleryPath)
						await deleteDoc(galleryDoc.ref)
					}))
				} else if (resource === 'contents') {
					const snap = await getDoc(doc(db, resource, String(id)))
					const data = snap.data() as any
					const folderPath = data?.image?.original ? getStorageFolderPath(data.image.original) : null
					if (folderPath) await deleteStorageFolder(folderPath)
				}
				await deleteDoc(doc(db, resource, String(id)))
			}))

			debugLog(`Deleted ${ids.length} documents`)
			return { data: ids }
		} catch (error) {
			debugError('deleteMany error', error)
			throw error
		}
	},
}
