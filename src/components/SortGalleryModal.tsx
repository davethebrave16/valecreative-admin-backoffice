import { useEffect, useState } from 'react'
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	LinearProgress,
	Snackbar,
	Tooltip,
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
	rectSortingStrategy,
	sortableKeyboardCoordinates,
	useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { collection, doc, getDocs, orderBy, query, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import type { GalleryImage } from '../types'

const BATCH_LIMIT = 500

type SortableGalleryImage = GalleryImage & { id: string }

interface SortGalleryModalProps {
	artworkId: string
	open: boolean
	onClose: () => void
	onSaved: () => void
}

const sortByPosition = (images: SortableGalleryImage[]) =>
	[...images].sort((a, b) => {
		const aPos = a.imagePosition ?? Infinity
		const bPos = b.imagePosition ?? Infinity
		if (aPos === Infinity && bPos === Infinity) return 0
		return aPos - bPos
	})

interface SortableGalleryCardProps {
	image: SortableGalleryImage
	disabled: boolean
}

const SortableGalleryCard = ({ image, disabled }: SortableGalleryCardProps) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: image.id,
		disabled,
	})

	return (
		<Box
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			sx={{
				border: '1px solid #e0e0e0',
				borderRadius: 1,
				p: 1,
				opacity: isDragging ? 0.5 : 1,
			}}
		>
			{!disabled && (
				<Box
					{...attributes}
					{...listeners}
					sx={{ display: 'flex', justifyContent: 'center', cursor: 'grab', mb: 0.5, touchAction: 'none' }}
					aria-label="Drag to reorder"
				>
					<DragIndicatorIcon fontSize="small" color="action" />
				</Box>
			)}
			<Box
				component="img"
				src={image.thumb ?? image.original}
				alt={image.alt ?? ''}
				sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 0.5, display: 'block' }}
			/>
			<Typography variant="caption" noWrap sx={{ display: 'block', mt: 0.5 }}>
				{image.alt ?? ''}
			</Typography>
		</Box>
	)
}

export const SortGalleryModal = ({ artworkId, open, onClose, onSaved }: SortGalleryModalProps) => {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)
	const [images, setImages] = useState<SortableGalleryImage[] | null>(null)
	const [initialOrder, setInitialOrder] = useState<string[] | null>(null)
	const [isSaving, setIsSaving] = useState(false)
	const [saveError, setSaveError] = useState(false)

	const fetchImages = async () => {
		setLoading(true)
		setError(false)
		try {
			const snap = await getDocs(
				query(collection(db, `artworks/${artworkId}/gallery`), orderBy('uploadedAt', 'asc')),
			)
			const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SortableGalleryImage)
			const sorted = sortByPosition(fetched)
			setImages(sorted)
			setInitialOrder(sorted.map((i) => i.id))
		} catch {
			setError(true)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (!open) {
			setImages(null)
			setInitialOrder(null)
			setSaveError(false)
			return
		}
		fetchImages()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open])

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	)

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (!images || !over || active.id === over.id) return
		const oldIndex = images.findIndex((i) => i.id === active.id)
		const newIndex = images.findIndex((i) => i.id === over.id)
		if (oldIndex === -1 || newIndex === -1) return
		setImages(arrayMove(images, oldIndex, newIndex))
	}

	const isDirty =
		!!images &&
		!!initialOrder &&
		images.length > 1 &&
		JSON.stringify(images.map((i) => i.id)) !== JSON.stringify(initialOrder)

	const handleSave = async () => {
		if (!images) return
		setIsSaving(true)
		setSaveError(false)
		try {
			const batches = [writeBatch(db)]
			let opsInCurrentBatch = 0

			images.forEach((image, index) => {
				if (opsInCurrentBatch >= BATCH_LIMIT) {
					batches.push(writeBatch(db))
					opsInCurrentBatch = 0
				}
				batches[batches.length - 1].update(doc(db, 'artworks', artworkId, 'gallery', image.id), {
					imagePosition: (index + 1) * 1000,
				})
				opsInCurrentBatch += 1
			})

			for (const batch of batches) await batch.commit()

			onSaved()
			onClose()
		} catch {
			setSaveError(true)
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<>
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
				<DialogTitle>Sort images</DialogTitle>
				<DialogContent dividers>
					{loading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
							<CircularProgress size={24} />
						</Box>
					) : error ? (
						<Box sx={{ textAlign: 'center', p: 2 }}>
							<Alert severity="error" sx={{ mb: 2 }}>
								Could not load images. Please try again.
							</Alert>
							<Button onClick={fetchImages} variant="outlined" size="small">
								Retry
							</Button>
						</Box>
					) : !images?.length ? (
						<Typography variant="body2" color="text.secondary">
							No images in this gallery
						</Typography>
					) : images.length === 1 ? (
						<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
							<SortableGalleryCard image={images[0]} disabled />
						</Box>
					) : (
						<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
							<SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
								<Box
									sx={{
										display: 'grid',
										gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
										gap: 1.5,
									}}
								>
									{images.map((image) => (
										<SortableGalleryCard key={image.id} image={image} disabled={false} />
									))}
								</Box>
							</SortableContext>
						</DndContext>
					)}
				</DialogContent>
				{isSaving && <LinearProgress />}
				<DialogActions>
					<Button onClick={onClose} variant="text" disabled={isSaving}>
						Cancel
					</Button>
					<Tooltip title={!images || images.length < 2 ? 'Add more images to reorder' : ''}>
						<span>
							<Button
								onClick={handleSave}
								variant="contained"
								disabled={!isDirty || isSaving}
								startIcon={isSaving ? <CircularProgress size={16} /> : null}
							>
								{isSaving ? 'Saving…' : 'Save order'}
							</Button>
						</span>
					</Tooltip>
				</DialogActions>
			</Dialog>
			<Snackbar
				open={saveError}
				autoHideDuration={5000}
				onClose={() => setSaveError(false)}
			>
				<Alert severity="error" onClose={() => setSaveError(false)}>
					Errore durante il salvataggio. Riprova.
				</Alert>
			</Snackbar>
		</>
	)
}
