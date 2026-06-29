import { useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { Box, Button, LinearProgress, TextField, Typography, Alert } from '@mui/material'
import { encode } from 'blurhash'
import { storage } from '../firebase'
import type { ImageObject } from '../types'

interface ImageUploadInputProps {
	source: string
	storagePath: string
	label?: string
}

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

export const ImageUploadInput = ({ source, storagePath, label = 'Image' }: ImageUploadInputProps) => {
	const { watch, setValue, register } = useFormContext()
	const current = watch(source) as ImageObject | undefined

	const [progress, setProgress] = useState<number | null>(null)
	const [uploadError, setUploadError] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const altSource = `${source}.alt`
	const { onChange: onAltChange, onBlur: onAltBlur, name: altName, ref: altRef } = register(altSource)

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		setUploadError(null)
		setProgress(0)

		const meta = await extractImageMeta(file)
		const uuid = crypto.randomUUID()
		const uploadRef = storageRef(storage, `${storagePath}/${uuid}/${file.name}`)
		const task = uploadBytesResumable(uploadRef, file)

		task.on(
			'state_changed',
			(snapshot) => {
				setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
			},
			(err) => {
				setUploadError(err.message)
				setProgress(null)
				if (fileInputRef.current) fileInputRef.current.value = ''
			},
			async () => {
				try {
					const downloadURL = await getDownloadURL(task.snapshot.ref)
					const imageObject: ImageObject = {
						original: downloadURL,
						alt: current?.alt ?? file.name.replace(/\.[^.]+$/, ''),
						width: meta.width,
						height: meta.height,
						blurHash: meta.blurHash,
						uploadedAt: new Date().toISOString(),
					}
					setValue(source, imageObject, { shouldDirty: true })
				} catch (err) {
					setUploadError(err instanceof Error ? err.message : 'Failed to get download URL')
				} finally {
					setProgress(null)
					if (fileInputRef.current) fileInputRef.current.value = ''
				}
			}
		)
	}

	return (
		<Box sx={{ width: '100%', mb: 1 }}>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
				{label}
			</Typography>

			{current?.original && (
				<Box sx={{ mb: 1.5 }}>
					<img
						src={current.original}
						alt={current.alt ?? ''}
						style={{
							maxWidth: 320,
							maxHeight: 200,
							objectFit: 'contain',
							display: 'block',
							borderRadius: 4,
							border: '1px solid #e0e0e0',
						}}
					/>
					{current.width && current.height ? (
						<Typography variant="caption" color="text.secondary">
							{current.width} × {current.height} px
						</Typography>
					) : null}
				</Box>
			)}

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
				disabled={progress !== null}
				sx={{ mb: 1.5 }}
			>
				{current?.original ? 'Replace image' : 'Upload image'}
			</Button>

			{progress !== null && (
				<Box sx={{ mb: 1.5 }}>
					<LinearProgress variant="determinate" value={progress} />
					<Typography variant="caption" color="text.secondary">
						{Math.round(progress)}%
					</Typography>
				</Box>
			)}

			{uploadError && (
				<Alert severity="error" sx={{ mb: 1.5 }}>
					{uploadError}
				</Alert>
			)}

			<TextField
				name={altName}
				inputRef={altRef}
				onChange={onAltChange}
				onBlur={onAltBlur}
				defaultValue={current?.alt ?? ''}
				label="Alt text"
				size="small"
				fullWidth
				helperText="Accessibility description of the image."
				disabled={progress !== null}
			/>
		</Box>
	)
}
