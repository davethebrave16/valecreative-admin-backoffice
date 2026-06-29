import { useState } from 'react'
import { useRecordContext, useResourceContext, useDataProvider, useDelete, useRedirect } from 'react-admin'
import DeleteIcon from '@mui/icons-material/Delete'
import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	List,
	ListItem,
	ListItemText,
} from '@mui/material'

interface GuardedDeleteButtonProps {
	checkField: 'techniqueId' | 'seriesId'
	resourceLabel: string
}

type Status = 'idle' | 'checking' | 'blocked' | 'confirm'

export const GuardedDeleteButton = ({ checkField, resourceLabel }: GuardedDeleteButtonProps) => {
	const record = useRecordContext()
	const resource = useResourceContext()
	const dataProvider = useDataProvider()
	const [deleteOne, { isPending: isDeleting }] = useDelete()
	const redirect = useRedirect()

	const [status, setStatus] = useState<Status>('idle')
	const [blockedBy, setBlockedBy] = useState<{ id: string; title: string }[]>([])

	const handleClick = async () => {
		if (!record) return
		setStatus('checking')
		try {
			const { data } = await dataProvider.getList('artworks', {
				filter: { [checkField]: record.id },
				pagination: { page: 1, perPage: 5 },
				sort: { field: 'createdAt', order: 'DESC' },
			})
			if (data.length > 0) {
				setBlockedBy(data.map((a) => ({ id: String(a.id), title: String(a.title ?? a.id) })))
				setStatus('blocked')
			} else {
				setStatus('confirm')
			}
		} catch {
			setStatus('confirm')
		}
	}

	const handleConfirm = () => {
		if (!record) return
		deleteOne(
			resource ?? '',
			{ id: record.id, previousData: record },
			{ onSuccess: () => redirect('list', resource ?? '') },
		)
		setStatus('idle')
	}

	const handleClose = () => setStatus('idle')

	const isChecking = status === 'checking'

	return (
		<>
			<Button
				variant="outlined"
				color="error"
				size="small"
				startIcon={isChecking ? <CircularProgress size={14} color="inherit" /> : <DeleteIcon />}
				onClick={handleClick}
				disabled={isChecking || isDeleting}
			>
				Delete
			</Button>

			{/* Blocked — artworks still reference this record */}
			<Dialog open={status === 'blocked'} onClose={handleClose}>
				<DialogTitle>Cannot delete this {resourceLabel}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						The following artwork{blockedBy.length > 1 ? 's are' : ' is'} still linked to this {resourceLabel}.
						Remove or reassign {blockedBy.length > 1 ? 'them' : 'it'} before deleting.
					</DialogContentText>
					<List dense>
						{blockedBy.map((a) => (
							<ListItem key={a.id} disableGutters>
								<ListItemText primary={a.title} />
							</ListItem>
						))}
					</List>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} variant="contained">Close</Button>
				</DialogActions>
			</Dialog>

			{/* Confirm — safe to delete */}
			<Dialog open={status === 'confirm'} onClose={handleClose}>
				<DialogTitle>Delete {resourceLabel}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						This action cannot be undone. Are you sure you want to delete this {resourceLabel}?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button onClick={handleConfirm} color="error" variant="contained" disabled={isDeleting}>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}
