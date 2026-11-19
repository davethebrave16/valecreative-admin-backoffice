import { useEffect, useMemo, useState } from 'react'
import { useRefresh } from 'react-admin'
import {
	Alert,
	Box,
	Button,
	Checkbox,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	LinearProgress,
	List,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	MenuItem,
	Snackbar,
	Stack,
	TextField,
	Typography,
} from '@mui/material'
import { collection, deleteField, doc, getDocs, writeBatch } from 'firebase/firestore'
import type { DocumentData, WriteBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { getCurrentAdminEmail } from '../utils/authUtils'
import { refId } from '../utils/refUtils'
import type { Artwork } from '../types'

const BATCH_LIMIT = 500

type FilterKey = 'all' | 'inThis' | 'unassigned' | 'inOther'

const FILTER_LABELS: Record<FilterKey, string> = {
	all: 'All',
	inThis: 'In this series',
	unassigned: 'Unassigned',
	inOther: 'In other series',
}

interface ArtworkRow {
	id: string
	title: string
	year?: number
	techniqueId?: string
	categoryIds: string[]
	coverImage?: Artwork['coverImage']
	/** Series the artwork belonged to when the dialog opened (id), if any. */
	initialSeriesId?: string
}

interface NamedOption {
	id: string
	name: string
}

interface SeriesInfo {
	name: string
	featuredArtworkId?: string
}

interface SeriesArtworksModalProps {
	open: boolean
	onClose: () => void
	seriesId: string
}

// seriesId is a DocumentReference when written by the backoffice, but tolerate plain strings.
const readSeriesId = (value: unknown): string | undefined => {
	if (!value) return undefined
	if (typeof value === 'string') return value.split('/').pop() || undefined
	const id = (value as { id?: unknown }).id
	return typeof id === 'string' && id ? id : undefined
}

// techniqueId / categoryIds can be DocumentReferences, paths or plain ids: reduce them all to the id.
const toId = (value: unknown): string | undefined => {
	if (typeof value === 'string' && value && !value.includes('/')) return value
	return refId(value)
}

const toNamedOptions = (docs: { id: string; data: () => DocumentData }[]): NamedOption[] =>
	docs
		.map((d) => ({ id: d.id, name: String(d.data().name ?? d.id) }))
		.sort((a, b) => a.name.localeCompare(b.name, 'it'))

const parseYear = (value: string): number | undefined => {
	const trimmed = value.trim()
	if (!trimmed) return undefined
	const n = Number(trimmed)
	return Number.isFinite(n) ? n : undefined
}

const compareRows = (a: ArtworkRow, b: ArtworkRow) => {
	if (a.year == null && b.year != null) return 1
	if (a.year != null && b.year == null) return -1
	if (a.year != null && b.year != null && a.year !== b.year) return a.year - b.year
	return a.title.localeCompare(b.title, 'it')
}

export const SeriesArtworksModal = ({ open, onClose, seriesId }: SeriesArtworksModalProps) => {
	const refresh = useRefresh()

	const [rows, setRows] = useState<ArtworkRow[] | null>(null)
	const [seriesById, setSeriesById] = useState<Record<string, SeriesInfo>>({})
	const [loadError, setLoadError] = useState<string | null>(null)
	const [selected, setSelected] = useState<Set<string>>(new Set())
	const [search, setSearch] = useState('')
	const [filter, setFilter] = useState<FilterKey>('all')
	const [techniques, setTechniques] = useState<NamedOption[]>([])
	const [categories, setCategories] = useState<NamedOption[]>([])
	const [techniqueFilter, setTechniqueFilter] = useState('')
	const [categoryFilter, setCategoryFilter] = useState('')
	const [yearFrom, setYearFrom] = useState('')
	const [yearTo, setYearTo] = useState('')
	const [isSaving, setIsSaving] = useState(false)
	const [saveError, setSaveError] = useState(false)

	// Fetch fresh on every open; discard everything on close.
	useEffect(() => {
		if (!open) {
			setRows(null)
			setLoadError(null)
			setSearch('')
			setFilter('all')
			setTechniqueFilter('')
			setCategoryFilter('')
			setYearFrom('')
			setYearTo('')
			return
		}
		let cancelled = false

		// Everything is loaded once per open; all filters then run client-side on these rows.
		Promise.all([
			getDocs(collection(db, 'artworks')),
			getDocs(collection(db, 'series')),
			getDocs(collection(db, 'techniques')),
			getDocs(collection(db, 'categories')),
		])
			.then(([artworksSnap, seriesSnap, techniquesSnap, categoriesSnap]) => {
				if (cancelled) return
				const seriesMap: Record<string, SeriesInfo> = {}
				seriesSnap.docs.forEach((d) => {
					const data = d.data() as DocumentData
					seriesMap[d.id] = {
						name: String(data.name ?? d.id),
						featuredArtworkId: typeof data.featuredArtworkId === 'string' ? data.featuredArtworkId : undefined,
					}
				})
				const loaded = artworksSnap.docs
					.map((d): ArtworkRow => {
						const data = d.data()
						return {
							id: d.id,
							title: String(data.title ?? d.id),
							year: typeof data.year === 'number' ? data.year : undefined,
							techniqueId: toId(data.techniqueId),
							categoryIds: Array.isArray(data.categoryIds)
								? data.categoryIds.map(toId).filter((id): id is string => !!id)
								: [],
							coverImage: data.coverImage as Artwork['coverImage'],
							initialSeriesId: readSeriesId(data.seriesId),
						}
					})
					.sort(compareRows)
				setSeriesById(seriesMap)
				setTechniques(toNamedOptions(techniquesSnap.docs))
				setCategories(toNamedOptions(categoriesSnap.docs))
				setRows(loaded)
				setSelected(new Set(loaded.filter((r) => r.initialSeriesId === seriesId).map((r) => r.id)))
			})
			.catch((err) => {
				if (cancelled) return
				setLoadError(err instanceof Error ? err.message : 'Failed to load artworks')
			})

		return () => {
			cancelled = true
		}
	}, [open, seriesId])

	const { added, removed, moved } = useMemo(() => {
		const result = { added: [] as ArtworkRow[], removed: [] as ArtworkRow[], moved: [] as ArtworkRow[] }
		for (const row of rows ?? []) {
			const wasIn = row.initialSeriesId === seriesId
			const isIn = selected.has(row.id)
			if (isIn && !wasIn) {
				result.added.push(row)
				if (row.initialSeriesId) result.moved.push(row)
			} else if (!isIn && wasIn) {
				result.removed.push(row)
			}
		}
		return result
	}, [rows, selected, seriesId])

	const hasChanges = added.length + removed.length > 0

	const hasActiveFilters =
		search.trim() !== '' ||
		filter !== 'all' ||
		techniqueFilter !== '' ||
		categoryFilter !== '' ||
		yearFrom.trim() !== '' ||
		yearTo.trim() !== ''

	const visibleRows = useMemo(() => {
		const needle = search.trim().toLowerCase()
		const from = parseYear(yearFrom)
		const to = parseYear(yearTo)
		const hasYearFilter = from !== undefined || to !== undefined
		return (rows ?? []).filter((row) => {
			if (needle && !row.title.toLowerCase().includes(needle)) return false
			if (techniqueFilter && row.techniqueId !== techniqueFilter) return false
			if (categoryFilter && !row.categoryIds.includes(categoryFilter)) return false
			if (hasYearFilter) {
				// Artworks without a year only match when no year filter is set.
				if (row.year === undefined) return false
				if (from !== undefined && row.year < from) return false
				if (to !== undefined && row.year > to) return false
			}
			if (filter === 'inThis') return selected.has(row.id)
			if (filter === 'unassigned') return !row.initialSeriesId && !selected.has(row.id)
			if (filter === 'inOther') return !!row.initialSeriesId && row.initialSeriesId !== seriesId
			return true
		})
	}, [rows, search, filter, techniqueFilter, categoryFilter, yearFrom, yearTo, selected, seriesId])

	const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((r) => selected.has(r.id))

	const handleResetFilters = () => {
		setSearch('')
		setFilter('all')
		setTechniqueFilter('')
		setCategoryFilter('')
		setYearFrom('')
		setYearTo('')
	}

	const handleToggle = (id: string) => {
		setSelected((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	const handleToggleAllVisible = () => {
		setSelected((prev) => {
			const next = new Set(prev)
			for (const row of visibleRows) {
				if (allVisibleSelected) next.delete(row.id)
				else next.add(row.id)
			}
			return next
		})
	}

	const handleSave = async () => {
		setIsSaving(true)
		setSaveError(false)
		try {
			const batches: WriteBatch[] = [writeBatch(db)]
			let opsInCurrentBatch = 0
			const stamp = () => ({ updatedAt: new Date(), updatedByAdmin: getCurrentAdminEmail() })

			const queue = (write: (batch: WriteBatch) => void) => {
				if (opsInCurrentBatch >= BATCH_LIMIT) {
					batches.push(writeBatch(db))
					opsInCurrentBatch = 0
				}
				write(batches[batches.length - 1])
				opsInCurrentBatch += 1
			}

			const clearedFeatured = new Set<string>()
			const clearFeaturedIfStale = (ownerSeriesId: string, artworkId: string) => {
				if (clearedFeatured.has(ownerSeriesId)) return
				if (seriesById[ownerSeriesId]?.featuredArtworkId !== artworkId) return
				clearedFeatured.add(ownerSeriesId)
				queue((batch) =>
					batch.update(doc(db, 'series', ownerSeriesId), { featuredArtworkId: deleteField(), ...stamp() }),
				)
			}

			for (const row of added) {
				// seriesId is always written as a DocumentReference, like the dataProvider does.
				queue((batch) =>
					batch.update(doc(db, 'artworks', row.id), { seriesId: doc(db, 'series', seriesId), ...stamp() }),
				)
				// Moved away from another series: that series must not keep it as its cover.
				if (row.initialSeriesId) clearFeaturedIfStale(row.initialSeriesId, row.id)
			}

			for (const row of removed) {
				queue((batch) => batch.update(doc(db, 'artworks', row.id), { seriesId: deleteField(), ...stamp() }))
				clearFeaturedIfStale(seriesId, row.id)
			}

			for (const batch of batches) {
				await batch.commit()
			}

			refresh()
			onClose()
		} catch {
			setSaveError(true)
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<>
			<Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="md">
				<DialogTitle>Manage artworks in this series</DialogTitle>
				<DialogContent dividers>
					{loadError && <Alert severity="error">{loadError}</Alert>}
					{!loadError && rows === null && <CircularProgress size={24} />}
					{rows && (
						<Stack spacing={2}>
							<TextField
								size="small"
								label="Search by title"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								fullWidth
							/>
							<Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
								{(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
									<Chip
										key={key}
										label={FILTER_LABELS[key]}
										color={filter === key ? 'primary' : 'default'}
										variant={filter === key ? 'filled' : 'outlined'}
										onClick={() => setFilter(key)}
									/>
								))}
							</Stack>
							<Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
								<TextField
									select
									size="small"
									label="Technique"
									value={techniqueFilter}
									onChange={(e) => setTechniqueFilter(e.target.value)}
									sx={{ minWidth: 180 }}
								>
									<MenuItem value="">Any</MenuItem>
									{techniques.map((t) => (
										<MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
									))}
								</TextField>
								<TextField
									select
									size="small"
									label="Category"
									value={categoryFilter}
									onChange={(e) => setCategoryFilter(e.target.value)}
									sx={{ minWidth: 180 }}
								>
									<MenuItem value="">Any</MenuItem>
									{categories.map((c) => (
										<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
									))}
								</TextField>
								<TextField
									size="small"
									type="number"
									label="Year from"
									value={yearFrom}
									onChange={(e) => setYearFrom(e.target.value)}
									sx={{ width: 110 }}
								/>
								<TextField
									size="small"
									type="number"
									label="Year to"
									value={yearTo}
									onChange={(e) => setYearTo(e.target.value)}
									sx={{ width: 110 }}
								/>
							</Stack>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<Stack direction="row" spacing={1}>
									<Button size="small" onClick={handleToggleAllVisible} disabled={visibleRows.length === 0}>
										{allVisibleSelected ? 'Deselect all visible' : 'Select all visible'}
									</Button>
									<Button size="small" onClick={handleResetFilters} disabled={!hasActiveFilters}>
										Reset filters
									</Button>
								</Stack>
								<Typography variant="body2" color="text.secondary">
									{visibleRows.length} of {rows.length} artworks · {selected.size} selected
								</Typography>
							</Box>
							{moved.length > 0 && (
								<Alert severity="warning">
									{moved.length} {moved.length === 1 ? 'artwork is' : 'artworks are'} currently in another series and
									will be moved here (an artwork can belong to only one series).
								</Alert>
							)}
							<List dense sx={{ maxHeight: 420, overflow: 'auto' }}>
								{visibleRows.map((row) => {
									const otherName =
										row.initialSeriesId && row.initialSeriesId !== seriesId
											? (seriesById[row.initialSeriesId]?.name ?? row.initialSeriesId)
											: undefined
									return (
										<ListItemButton key={row.id} onClick={() => handleToggle(row.id)} dense>
											<Checkbox edge="start" checked={selected.has(row.id)} tabIndex={-1} disableRipple />
											<ListItemAvatar>
												{row.coverImage?.thumb || row.coverImage?.original ? (
													<img
														src={row.coverImage.thumb ?? row.coverImage.original}
														alt=""
														loading="lazy"
														style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, display: 'block' }}
													/>
												) : (
													<Box sx={{ width: 48, height: 48, borderRadius: '4px', backgroundColor: '#e0e0e0' }} />
												)}
											</ListItemAvatar>
											<ListItemText
												sx={{ ml: 1 }}
												primary={row.title}
												secondary={row.year != null ? String(row.year) : 'No year'}
											/>
											{otherName && <Chip size="small" color="warning" variant="outlined" label={`Series: ${otherName}`} />}
										</ListItemButton>
									)
								})}
								{visibleRows.length === 0 && (
									<Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
										No artworks match.
									</Typography>
								)}
							</List>
						</Stack>
					)}
				</DialogContent>
				{isSaving && <LinearProgress />}
				<DialogActions>
					<Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, pl: 2 }}>
						{hasChanges ? `+${added.length} added · −${removed.length} removed` : 'No changes'}
					</Typography>
					<Button variant="text" onClick={onClose} disabled={isSaving}>Cancel</Button>
					<Button variant="contained" onClick={handleSave} disabled={!hasChanges || isSaving}>Save</Button>
				</DialogActions>
			</Dialog>
			<Snackbar open={saveError} autoHideDuration={5000} onClose={() => setSaveError(false)}>
				<Alert severity="error" onClose={() => setSaveError(false)}>
					Errore durante il salvataggio. Riprova.
				</Alert>
			</Snackbar>
		</>
	)
}
