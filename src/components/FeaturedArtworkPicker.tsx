import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useGetOne, useRecordContext } from 'react-admin'
import {
	Alert,
	Box,
	CircularProgress,
	List,
	ListItemButton,
	ListItemAvatar,
	ListItemText,
	Radio,
	Typography,
} from '@mui/material'
import { collection, doc, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import type { Artwork } from '../types'

interface ArtworkOption {
	id: string
	title: string
	coverImage?: Artwork['coverImage']
}

const Thumbnail = ({ coverImage, alt, size }: { coverImage?: Artwork['coverImage']; alt: string; size: number }) =>
	coverImage?.thumb || coverImage?.original ? (
		<img
			src={coverImage.thumb ?? coverImage.original}
			alt={alt}
			style={{ width: size, height: size, objectFit: 'cover', borderRadius: 4, display: 'block' }}
		/>
	) : (
		<Box sx={{ width: size, height: size, borderRadius: '4px', backgroundColor: '#e0e0e0' }} />
	)

interface FeaturedArtworkInputProps {
	source: string
	/** Which relation limits the candidate artworks. Defaults to 'category'. */
	membership?: 'category' | 'series'
}

const toOption = (d: { id: string; data: () => Record<string, unknown> }): ArtworkOption => ({
	id: d.id,
	title: String(d.data().title ?? d.id),
	coverImage: d.data().coverImage as Artwork['coverImage'],
})

// Series membership: backoffice writes seriesId as a DocumentReference, but older data may hold
// a plain string id — query both and merge so no candidate is missed.
const fetchSeriesArtworks = async (seriesId: string): Promise<ArtworkOption[]> => {
	const artworks = collection(db, 'artworks')
	const [byRef, byString] = await Promise.all([
		getDocs(query(artworks, where('seriesId', '==', doc(db, 'series', seriesId)))),
		getDocs(query(artworks, where('seriesId', '==', seriesId))),
	])
	const merged = new Map<string, ArtworkOption>()
	for (const d of [...byRef.docs, ...byString.docs]) merged.set(d.id, toOption(d))
	return [...merged.values()]
}

const fetchCategoryArtworks = async (categoryId: string): Promise<ArtworkOption[]> => {
	const snap = await getDocs(
		query(collection(db, 'artworks'), where('categoryIds', 'array-contains', categoryId)),
	)
	return snap.docs.map(toOption)
}

export const FeaturedArtworkInput = ({ source, membership = 'category' }: FeaturedArtworkInputProps) => {
	const record = useRecordContext()
	const { watch, setValue, register } = useFormContext()
	register(source)
	const selectedId = watch(source) as string | undefined

	const [options, setOptions] = useState<ArtworkOption[] | null>(null)
	const [loadError, setLoadError] = useState<string | null>(null)

	useEffect(() => {
		if (!record) return
		let cancelled = false

		setOptions(null)
		setLoadError(null)

		const load = membership === 'series' ? fetchSeriesArtworks : fetchCategoryArtworks
		load(String(record.id))
			.then((items) => {
				if (cancelled) return
				setOptions(items)
			})
			.catch((err) => {
				if (cancelled) return
				setLoadError(err instanceof Error ? err.message : 'Failed to load artworks')
			})

		return () => {
			cancelled = true
		}
	}, [record, membership])

	if (options === null && !loadError) {
		return <CircularProgress size={24} />
	}

	if (loadError) {
		return <Alert severity="error">{loadError}</Alert>
	}

	if (options && options.length === 0) {
		return (
			<Alert severity="info">
				No artworks currently belong to this {membership}. Link some artworks to this {membership} first
				{membership === 'series' ? ' (use "Manage artworks" on the series page)' : ''}, then a featured
				artwork can be selected here.
			</Alert>
		)
	}

	return (
		<List dense sx={{ width: '100%', maxWidth: 480 }}>
			<ListItemButton
				selected={!selectedId}
				onClick={() => setValue(source, undefined, { shouldDirty: true })}
			>
				<Radio checked={!selectedId} size="small" sx={{ mr: 1 }} />
				<ListItemText primary="None" secondary="No featured artwork" />
			</ListItemButton>
			{options?.map((artwork) => (
				<ListItemButton
					key={artwork.id}
					selected={selectedId === artwork.id}
					onClick={() => setValue(source, artwork.id, { shouldDirty: true })}
				>
					<Radio checked={selectedId === artwork.id} size="small" sx={{ mr: 1 }} />
					<ListItemAvatar>
						<Thumbnail coverImage={artwork.coverImage} alt={artwork.title} size={48} />
					</ListItemAvatar>
					<ListItemText primary={artwork.title} sx={{ ml: 1 }} />
				</ListItemButton>
			))}
		</List>
	)
}

interface FeaturedArtworkPreviewProps {
	size?: 'small' | 'large'
	/** Not used in the component itself: react-admin's Datagrid reads it as the column header. */
	label?: string
}

export const FeaturedArtworkPreview = ({ size = 'small' }: FeaturedArtworkPreviewProps) => {
	const record = useRecordContext<{ featuredArtworkId?: string }>()
	const { data: artwork, isPending } = useGetOne<Artwork>(
		'artworks',
		{ id: record?.featuredArtworkId as string },
		{ enabled: !!record?.featuredArtworkId }
	)

	if (!record?.featuredArtworkId) {
		return size === 'large' ? (
			<Typography variant="body2" color="text.secondary">No featured artwork selected</Typography>
		) : null
	}

	if (isPending) {
		return <CircularProgress size={size === 'large' ? 32 : 20} />
	}

	const pixels = size === 'large' ? 120 : 48

	return (
		<Box>
			<Thumbnail coverImage={artwork?.coverImage} alt={artwork?.title ?? ''} size={pixels} />
			{size === 'large' && artwork?.title ? (
				<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
					{artwork.title}
				</Typography>
			) : null}
		</Box>
	)
}
