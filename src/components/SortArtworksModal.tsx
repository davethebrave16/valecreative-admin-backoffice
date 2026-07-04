import { useEffect, useState } from 'react'
import { useGetList, useRefresh } from 'react-admin'
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	LinearProgress,
	Paper,
	Snackbar,
	Tab,
	Tabs,
	Typography,
} from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { doc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import type { Artwork } from '../types'

interface SortArtworksModalProps {
	open: boolean
	onClose: () => void
}

type TabKey = 'personal' | 'commissioned' | 'featured'
type PositionField = 'galleryPosition' | 'featuredPosition'

const TAB_CONFIG: Record<TabKey, { label: string; filter: Record<string, unknown>; positionField: PositionField }> = {
	personal: { label: 'Personal Gallery', filter: { origin: 'personal' }, positionField: 'galleryPosition' },
	commissioned: { label: 'Commissioned Gallery', filter: { origin: 'commissioned' }, positionField: 'galleryPosition' },
	featured: { label: 'Featured', filter: { featured: true }, positionField: 'featuredPosition' },
}

const TAB_KEYS: TabKey[] = ['personal', 'commissioned', 'featured']

const BATCH_LIMIT = 500

function sortByPosition(data: Artwork[], field: PositionField): Artwork[] {
	return [...data].sort((a, b) => (a[field] ?? Infinity) - (b[field] ?? Infinity))
}

function idsOf(artworks: Artwork[]): string[] {
	return artworks.map((a) => String(a.id))
}

interface SortableRowProps {
	artwork: Artwork
}

const SortableRow = ({ artwork }: SortableRowProps) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: artwork.id })
	const thumb = artwork.coverImage?.thumb ?? artwork.coverImage?.original

	return (
		<Paper
			ref={setNodeRef}
			variant="outlined"
			style={{ transform: CSS.Transform.toString(transform), transition: transition ?? undefined }}
			sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, mb: 1, opacity: isDragging ? 0.5 : 1 }}
		>
			<Box
				{...attributes}
				{...listeners}
				sx={{ display: 'flex', alignItems: 'center', cursor: 'grab', touchAction: 'none' }}
				aria-label="Drag to reorder"
			>
				<DragIndicatorIcon color="action" />
			</Box>
			{thumb ? (
				<img
					src={thumb}
					alt={artwork.title ?? ''}
					style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, display: 'block' }}
				/>
			) : (
				<Box sx={{ width: 48, height: 48, borderRadius: 1, background: '#e0e0e0' }} />
			)}
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography variant="body1" noWrap>{artwork.title}</Typography>
				<Typography variant="body2" color="text.secondary">{artwork.year}</Typography>
			</Box>
		</Paper>
	)
}

interface TabPanelProps {
	artworks: Artwork[] | null
	isLoading: boolean
	onReorder: (next: Artwork[]) => void
}

const SortableTabPanel = ({ artworks, isLoading, onReorder }: TabPanelProps) => {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	)

	if (isLoading) {
		return (
			<Box sx={{ p: 2 }}>
				<LinearProgress />
			</Box>
		)
	}

	if (!artworks || artworks.length === 0) {
		return (
			<Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
				No artworks found
			</Typography>
		)
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (!over || active.id === over.id) return
		const oldIndex = artworks.findIndex((a) => a.id === active.id)
		const newIndex = artworks.findIndex((a) => a.id === over.id)
		if (oldIndex === -1 || newIndex === -1) return
		onReorder(arrayMove(artworks, oldIndex, newIndex))
	}

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
			<SortableContext items={artworks.map((a) => a.id)} strategy={verticalListSortingStrategy}>
				<Box sx={{ maxHeight: 480, overflowY: 'auto', p: 1 }}>
					{artworks.map((artwork) => (
						<SortableRow key={artwork.id} artwork={artwork} />
					))}
				</Box>
			</SortableContext>
		</DndContext>
	)
}

interface SortableTabState {
	order: Artwork[] | null
	setOrder: (next: Artwork[]) => void
	hasChanges: boolean
	isLoading: boolean
}

function useSortableTab(tabKey: TabKey, open: boolean): SortableTabState {
	const { filter, positionField } = TAB_CONFIG[tabKey]
	const [order, setOrder] = useState<Artwork[] | null>(null)
	const [initialIds, setInitialIds] = useState<string[] | null>(null)

	const { data, isPending } = useGetList<Artwork>('artworks', {
		pagination: { page: 1, perPage: 200 },
		filter,
	})

	// Reset local state on close so the next open re-seeds from fresh data instead of stale edits.
	useEffect(() => {
		if (open) return
		setOrder(null)
		setInitialIds(null)
	}, [open])

	useEffect(() => {
		if (!open || !data || initialIds !== null) return
		const sorted = sortByPosition(data, positionField)
		setOrder(sorted)
		setInitialIds(idsOf(sorted))
	}, [open, data, initialIds, positionField])

	const hasChanges = !!order && !!initialIds && JSON.stringify(idsOf(order)) !== JSON.stringify(initialIds)

	return { order, setOrder, hasChanges, isLoading: isPending && order === null }
}

export const SortArtworksModal = ({ open, onClose }: SortArtworksModalProps) => {
	const refresh = useRefresh()
	const [activeTab, setActiveTab] = useState<TabKey>('personal')
	const [isSaving, setIsSaving] = useState(false)
	const [saveError, setSaveError] = useState(false)

	const personalTab = useSortableTab('personal', open)
	const commissionedTab = useSortableTab('commissioned', open)
	const featuredTab = useSortableTab('featured', open)
	const tabState: Record<TabKey, SortableTabState> = {
		personal: personalTab,
		commissioned: commissionedTab,
		featured: featuredTab,
	}

	// Reset the active tab on close so reopening always starts from "Personal Gallery".
	useEffect(() => {
		if (open) return
		setActiveTab('personal')
		setSaveError(false)
	}, [open])

	if (!open) return null

	const hasChanges = TAB_KEYS.some((key) => tabState[key].hasChanges)

	const handleSave = async () => {
		setIsSaving(true)
		setSaveError(false)
		try {
			const batches = [writeBatch(db)]
			let opsInCurrentBatch = 0

			const queueUpdate = (id: string | number, field: PositionField, value: number) => {
				if (opsInCurrentBatch >= BATCH_LIMIT) {
					batches.push(writeBatch(db))
					opsInCurrentBatch = 0
				}
				batches[batches.length - 1].update(doc(db, 'artworks', String(id)), { [field]: value })
				opsInCurrentBatch += 1
			}

			for (const key of TAB_KEYS) {
				const { order, hasChanges: changed } = tabState[key]
				if (!changed || !order) continue
				const { positionField } = TAB_CONFIG[key]
				order.forEach((artwork, index) => queueUpdate(artwork.id, positionField, (index + 1) * 1000))
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

	const activeState = tabState[activeTab]

	return (
		<>
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
				<DialogTitle>Sort artworks</DialogTitle>
				<Tabs value={activeTab} onChange={(_, value: TabKey) => setActiveTab(value)} sx={{ px: 3 }}>
					{TAB_KEYS.map((key) => (
						<Tab key={key} label={TAB_CONFIG[key].label} value={key} />
					))}
				</Tabs>
				<DialogContent dividers>
					<SortableTabPanel
						artworks={activeState.order}
						isLoading={activeState.isLoading}
						onReorder={activeState.setOrder}
					/>
				</DialogContent>
				{isSaving && <LinearProgress />}
				<DialogActions>
					<Button variant="text" onClick={onClose} disabled={isSaving}>Cancel</Button>
					<Button variant="contained" onClick={handleSave} disabled={!hasChanges || isSaving}>Save order</Button>
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
