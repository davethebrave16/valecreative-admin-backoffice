import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material'
import { RocketLaunch as RocketLaunchIcon, Check as CheckIcon } from '@mui/icons-material'

type ButtonState = 'idle' | 'loading' | 'success'

export const PublishButton = () => {
	const [state, setState] = useState<ButtonState>('idle')
	const [errorOpen, setErrorOpen] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

	const handlePublish = async () => {
		setState('loading')
		try {
			await httpsCallable(functions, 'publishSite')()
			setState('success')
			setTimeout(() => setState('idle'), 3000)
		} catch (err) {
			setState('idle')
			setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
			setErrorOpen(true)
		}
	}

	return (
		<>
			{state === 'idle' && (
				<Button
					variant="contained"
					startIcon={<RocketLaunchIcon />}
					onClick={handlePublish}
					size="small"
					sx={{ textTransform: 'none', fontWeight: 600 }}
				>
					Publish site
				</Button>
			)}
			{state === 'loading' && (
				<Button
					variant="contained"
					disabled
					startIcon={<CircularProgress size={16} color="inherit" />}
					size="small"
					sx={{ textTransform: 'none', fontWeight: 600 }}
				>
					Publishing…
				</Button>
			)}
			{state === 'success' && (
				<Button
					variant="contained"
					color="success"
					startIcon={<CheckIcon />}
					size="small"
					sx={{ textTransform: 'none', fontWeight: 600 }}
				>
					Published ✓
				</Button>
			)}
			<Snackbar
				open={errorOpen}
				autoHideDuration={6000}
				onClose={() => setErrorOpen(false)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert severity="error" onClose={() => setErrorOpen(false)} variant="filled">
					{errorMessage}
				</Alert>
			</Snackbar>
		</>
	)
}
