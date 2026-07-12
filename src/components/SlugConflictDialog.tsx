import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Link } from '@mui/material'
import type { Artwork } from '../types'

type SlugConflictDialogProps = {
	open: boolean
	slug?: string
	conflict?: Artwork
	onClose: () => void
}

export const SlugConflictDialog = ({ open, slug, conflict, onClose }: SlugConflictDialogProps) => (
	<Dialog open={open} onClose={onClose}>
		<DialogTitle>Slug already in use</DialogTitle>
		<DialogContent>
			<DialogContentText>
				Another artwork, <strong>"{conflict?.title}"</strong>, already uses the slug{' '}
				<strong>"{slug}"</strong>. Two artworks with the same slug will conflict on the public site.
				Please change the slug before saving.
			</DialogContentText>
			{conflict && (
				<Link
					href={`${window.location.origin}${window.location.pathname}#/artworks/${conflict.id}/show`}
					target="_blank"
					rel="noopener noreferrer"
					sx={{ display: 'inline-block', mt: 1.5 }}
				>
					Open "{conflict.title}" in a new tab
				</Link>
			)}
		</DialogContent>
		<DialogActions>
			<Button onClick={onClose} variant="contained" color="primary">Ok</Button>
		</DialogActions>
	</Dialog>
)
