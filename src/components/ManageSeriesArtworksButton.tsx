import { useState } from 'react'
import { Button, useRecordContext } from 'react-admin'
import CollectionsIcon from '@mui/icons-material/Collections'
import { SeriesArtworksModal } from './SeriesArtworksModal'

export const ManageSeriesArtworksButton = () => {
	const record = useRecordContext()
	const [isOpen, setIsOpen] = useState(false)

	if (!record) return null

	const handleOpen = () => setIsOpen(true)
	const handleClose = () => setIsOpen(false)

	return (
		<>
			<Button label="Manage artworks" onClick={handleOpen}>
				<CollectionsIcon />
			</Button>
			<SeriesArtworksModal open={isOpen} onClose={handleClose} seriesId={String(record.id)} />
		</>
	)
}
