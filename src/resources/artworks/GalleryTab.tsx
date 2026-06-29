import { useRef, useState } from 'react'
import { useRecordContext, useGetList, useCreate, useUpdate, useDelete } from 'react-admin'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { encode } from 'blurhash'
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	IconButton,
	LinearProgress,
	TextField,
	Typography,
	Alert,
	CircularProgress,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { storage } from '../../firebase'
import type { GalleryImage } from '../../types'

async function extractImageMeta(file: File): Promise<{ width: number; height: number; blurHash: string }> {
	return new Promise((resolve) => {
		const objectUrl = URL.createObjectURL(file)
		const img = new Image()

		img.onload = () => {
			const { naturalWidth: width, naturalHeight: height } = img
			const thumbSize = 64
			const thumbHeight = Math.max(1, Math.round((height / width) * thumbSize))
			const canvas = document.createElement('canvas')
			canvas.width = thumbSize
			canvas.height = thumbHeight
			const ctx = canvas.getContext('2d')

			if (!ctx) {
				URL.revokeObjectURL(objectUrl)
				resolve({ width, height, blurHash: '' })
				return
			}

			ctx.drawImage(img, 0, 0, thumbSize, thumbHeight)
			const imageData = ctx.getImageData(0, 0, thumbSize, thumbHeight)
			URL.revokeObjectURL(objectUrl)

			try {
				const blurHash = encode(imageData.data, thumbSize, thumbHeight, 4, 3)
				resolve({ width, height, blurHash })
			} catch {
				resolve({ width, height, blurHash: '' })
			}
		}

		img.onerror = () => {
			URL.revokeObjectURL(objectUrl)
			resolve({ width: 0, height: 0, blurHash: '' })
		}

		img.src = objectUrl
	})
}

interface DeleteConfirmDialogProps {
	open: boolean
	onClose: () => void
	onConfirm: () => void
}

const DeleteConfirmDialog = ({ open, onClose, onConfirm }: DeleteConfirmDialogProps) => (
	<Dialog open={open} onClose={onClose}>
		<DialogTitle>Delete image</DialogTitle>
		<DialogContent>
			<DialogContentText>
				This action cannot be undone. Are you sure you want to remove this image from the gallery?
			</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button onClick={onClose}>Cancel</Button>
			<Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
		</DialogActions>
	</Dialog>
)

interface GalleryCardProps {
	image: GalleryImage
	artworkId: string | number
	onDeleted: () => void
}

const GalleryCard = ({ image, artworkId, onDeleted }: GalleryCardProps) => {
	const [dialogOpen, setDialogOpen] = useState(false)
	const [caption, setCaption] = useState(image.caption ?? '')
	const [update] = useUpdate()
	const [deleteOne, { isPending: isDeleting }] = useDelete()

	const handleCaptionBlur = () => {
		if (caption === (image.caption ?? '')) return
		update('gallery', {
			id: image.id,
			data: { caption },
			previousData: image,
			meta: { parentResource: 'artworks', parentId: artworkId },
		})
	}

	const handleDelete = () => {
		deleteOne(
			'gallery',
			{
				id: image.id,
				previousData: image,
				meta: { parentResource: 'artworks', parentId: artworkId },
			},
			{ onSuccess: onDeleted },
		)
		setDialogOpen(false)
	}

	return (
		<Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 1.5, position: 'relative' }}>
			<img
				src={image.original}
				alt={image.alt ?? ''}
				style={{
					width: '100%',
					maxHeight: 200,
					objectFit: 'contain',
					display: 'block',
					borderRadius: 4,
					marginBottom: 8,
					background: '#fafafa',
				}}
			/>
			{image.width && image.height ? (
				<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
					{image.width} × {image.height} px
				</Typography>
			) : null}
			<TextField
				label="Caption"
				size="small"
				fullWidth
				value={caption}
				onChange={(e) => setCaption(e.target.value)}
				onBlur={handleCaptionBlur}
				multiline
				rows={2}
				helperText="Saved on blur."
				sx={{ mb: 1 }}
			/>
			<IconButton
				size="small"
				color="error"
				onClick={() => setDialogOpen(true)}
				disabled={isDeleting}
				aria-label="Remove image"
			>
				{isDeleting ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
			</IconButton>

			<DeleteConfirmDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onConfirm={handleDelete}
			/>
		</Box>
	)
}

export const GalleryTab = () => {
	const record = useRecordContext()
	const artworkId = record?.id

	const { data: images, isPending, refetch } = useGetList<GalleryImage>('gallery', {
		pagination: { page: 1, perPage: 100 },
		sort: { field: 'uploadedAt', order: 'ASC' },
		meta: { parentResource: 'artworks', parentId: artworkId },
	})

	const [create] = useCreate()
	const [uploadProgress, setUploadProgress] = useState<number | null>(null)
	const [uploadError, setUploadError] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file || !artworkId) return

		setUploadError(null)
		setUploadProgress(0)

		const meta = await extractImageMeta(file)
		const uuid = crypto.randomUUID()
		const uploadRef = storageRef(storage, `artworks/${artworkId}/gallery/${uuid}/${file.name}`)
		const task = uploadBytesResumable(uploadRef, file)

		task.on(
			'state_changed',
			(snapshot) => {
				setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
			},
			(err) => {
				setUploadError(err.message)
				setUploadProgress(null)
				if (fileInputRef.current) fileInputRef.current.value = ''
			},
			async () => {
				try {
					const downloadURL = await getDownloadURL(task.snapshot.ref)
					const galleryDoc: Omit<GalleryImage, 'id'> = {
						original: downloadURL,
						alt: file.name.replace(/\.[^.]+$/, ''),
						width: meta.width,
						height: meta.height,
						blurHash: meta.blurHash,
						caption: '',
						uploadedAt: new Date().toISOString(),
					}
					create(
						'gallery',
						{
							data: galleryDoc,
							meta: { parentResource: 'artworks', parentId: artworkId },
						},
						{ onSuccess: () => refetch() },
					)
				} catch (err) {
					setUploadError(err instanceof Error ? err.message : 'Failed to get download URL')
				} finally {
					setUploadProgress(null)
					if (fileInputRef.current) fileInputRef.current.value = ''
				}
			},
		)
	}

	if (!artworkId) return null

	return (
		<Box sx={{ p: 2 }}>
			<Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					style={{ display: 'none' }}
					onChange={handleFileChange}
				/>
				<Button
					variant="outlined"
					size="small"
					onClick={() => fileInputRef.current?.click()}
					disabled={uploadProgress !== null}
				>
					Add image
				</Button>
				{uploadProgress !== null && (
					<Box sx={{ flex: 1, maxWidth: 240 }}>
						<LinearProgress variant="determinate" value={uploadProgress} />
						<Typography variant="caption" color="text.secondary">
							{Math.round(uploadProgress)}%
						</Typography>
					</Box>
				)}
			</Box>

			{uploadError && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{uploadError}
				</Alert>
			)}

			{isPending ? (
				<CircularProgress size={24} />
			) : !images?.length ? (
				<Typography variant="body2" color="text.secondary">
					No images in the gallery yet.
				</Typography>
			) : (
				<Grid container spacing={2}>
					{images.map((image) => (
						<Grid key={image.id} size={{ xs: 12, sm: 6, md: 4 }}>
							<GalleryCard
								image={image}
								artworkId={artworkId}
								onDeleted={() => refetch()}
							/>
						</Grid>
					))}
				</Grid>
			)}
		</Box>
	)
}
