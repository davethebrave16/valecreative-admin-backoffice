import { useMemo } from 'react'
import { useGetList } from 'react-admin'
import { COMMISSION_FIELDS } from '../types'
import type { Artwork, Commission, Technique } from '../types'

export interface DashboardStats {
	isLoading: boolean
	newCommissionsCount: number
	lastCommissionRequestedAt: Date | string | number | null
	inProgressCommissionsCount: number
	closedCommissionsCount: number
	artworksCount: number
	mostUsedTechniqueName: string | null
}

export const useDashboardStats = (): DashboardStats => {
	const { total: newCommissionsCount, isPending: newPending } = useGetList<Commission>('commissions', {
		pagination: { page: 1, perPage: 1 },
		filter: { [COMMISSION_FIELDS.STATUS]: 'new' },
	})

	const { data: latestCommissions, isPending: latestPending } = useGetList<Commission>('commissions', {
		pagination: { page: 1, perPage: 1 },
		sort: { field: COMMISSION_FIELDS.REQUESTED_AT, order: 'DESC' },
	})

	const { total: inProgressCommissionsCount, isPending: inProgressPending } = useGetList<Commission>('commissions', {
		pagination: { page: 1, perPage: 1 },
		filter: { [COMMISSION_FIELDS.STATUS]: 'in_progress' },
	})

	const { total: completedCount, isPending: completedPending } = useGetList<Commission>('commissions', {
		pagination: { page: 1, perPage: 1 },
		filter: { [COMMISSION_FIELDS.STATUS]: 'completed' },
	})

	const { total: declinedCount, isPending: declinedPending } = useGetList<Commission>('commissions', {
		pagination: { page: 1, perPage: 1 },
		filter: { [COMMISSION_FIELDS.STATUS]: 'declined' },
	})

	const { total: artworksCount, isPending: artworksCountPending } = useGetList<Artwork>('artworks', {
		pagination: { page: 1, perPage: 1 },
	})

	const { data: allArtworks, isPending: allArtworksPending } = useGetList<Artwork>('artworks', {
		pagination: { page: 1, perPage: 1000 },
	})

	const { data: allTechniques, isPending: allTechniquesPending } = useGetList<Technique>('techniques', {
		pagination: { page: 1, perPage: 1000 },
	})

	const mostUsedTechniqueName = useMemo(() => {
		if (!allArtworks || allArtworks.length === 0 || !allTechniques) return null

		const tally = new Map<string, number>()
		for (const artwork of allArtworks) {
			if (!artwork.techniqueId) continue
			tally.set(artwork.techniqueId, (tally.get(artwork.techniqueId) ?? 0) + 1)
		}

		let topId: string | null = null
		let topCount = 0
		for (const [id, count] of tally) {
			if (count > topCount) {
				topId = id
				topCount = count
			}
		}

		if (!topId) return null
		return allTechniques.find((technique) => technique.id === topId)?.name ?? null
	}, [allArtworks, allTechniques])

	const isLoading =
		newPending ||
		latestPending ||
		inProgressPending ||
		completedPending ||
		declinedPending ||
		artworksCountPending ||
		allArtworksPending ||
		allTechniquesPending

	return {
		isLoading,
		newCommissionsCount: newCommissionsCount ?? 0,
		lastCommissionRequestedAt: latestCommissions?.[0]?.requestedAt ?? null,
		inProgressCommissionsCount: inProgressCommissionsCount ?? 0,
		closedCommissionsCount: (completedCount ?? 0) + (declinedCount ?? 0),
		artworksCount: artworksCount ?? 0,
		mostUsedTechniqueName,
	}
}
