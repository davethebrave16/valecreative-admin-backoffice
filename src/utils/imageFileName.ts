import { toSlug } from './slugify'

// Storage file naming, inside the per-upload `{uuid}` folder. The normalization script for existing
// files must follow the same rules so old and new files stay consistent:
//   cover image   → {slug}.{ext}
//   gallery image → {slug}-{n}.{ext}   (n = position in the gallery, 1-based)
// The extension is lowercased; the base name never contains spaces or accents.

export const fileExtension = (fileName: string): string => {
	const match = /\.([A-Za-z0-9]+)$/.exec(fileName)
	return match ? match[1].toLowerCase() : 'jpg'
}

const baseFromOriginal = (fileName: string): string =>
	toSlug(fileName.replace(/\.[^.]+$/, '')) || 'image'

export const coverFileName = (slug: string | undefined, fileName: string): string => {
	const base = toSlug(slug ?? '') || baseFromOriginal(fileName)
	return `${base}.${fileExtension(fileName)}`
}

export const galleryFileName = (
	slug: string | undefined,
	n: number,
	fileName: string,
	existingNames: string[],
): string => {
	const base = toSlug(slug ?? '') || baseFromOriginal(fileName)
	const ext = fileExtension(fileName)
	const candidate = `${base}-${n}.${ext}`
	if (!existingNames.includes(candidate)) return candidate
	return `${base}-${n}-${crypto.randomUUID().slice(0, 4)}.${ext}`
}

// Decoded file name from a Firebase Storage download URL (…/o/folder%2Fuuid%2Fname.jpg?alt=media…).
export const fileNameFromUrl = (downloadUrl: string): string => {
	try {
		const path = decodeURIComponent(new URL(downloadUrl).pathname.split('/o/')[1] ?? '')
		return path.split('/').pop() ?? ''
	} catch {
		return ''
	}
}
