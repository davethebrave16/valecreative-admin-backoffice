import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '../firebase'
import type { Artwork } from '../types'

export const findArtworkBySlug = async (
	slug: string,
	excludeId?: string,
): Promise<Artwork | undefined> => {
	if (!slug) return undefined
	const snap = await getDocs(
		query(collection(db, 'artworks'), where('slug', '==', slug), limit(2))
	)
	return snap.docs
		.map((d) => ({ id: d.id, ...d.data() } as Artwork))
		.find((a) => a.id !== excludeId)
}
