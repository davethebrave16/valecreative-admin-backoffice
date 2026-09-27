import { ref, listAll, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'

export function getStorageFolderPath(downloadUrl: string): string | null {
	try {
		return ref(storage, downloadUrl).parent?.fullPath ?? null
	} catch {
		return null
	}
}

export async function deleteStorageFolder(folderPath: string): Promise<void> {
	try {
		const folderRef = ref(storage, folderPath)
		const { items, prefixes } = await listAll(folderRef)
		await Promise.all([
			...items.map(item => deleteObject(item)),
			...prefixes.map(prefix => deleteStorageFolder(prefix.fullPath)),
		])
	} catch {
		// best-effort: don't fail the overall delete if storage cleanup fails
	}
}

// Every upload lands in a fresh `{uuid}` folder, so a download URL never changes content:
// safe to let browsers and CDNs cache it forever.
export const IMAGE_UPLOAD_METADATA = { cacheControl: 'public, max-age=31536000, immutable' }
