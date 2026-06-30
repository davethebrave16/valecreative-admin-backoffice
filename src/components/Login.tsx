import { useState } from 'react'
import { useLogin, useNotify } from 'react-admin'
import { Button, Card, CardContent, Typography, Box, Alert } from '@mui/material'
import { Google as GoogleIcon } from '@mui/icons-material'

const Login = () => {
	const [loading, setLoading] = useState(false)
	const login = useLogin()
	const notify = useNotify()

	const handleGoogleLogin = async () => {
		try {
			setLoading(true)
			await login({})
		} catch (error) {
			console.error('Login error:', error)
			notify('Login failed. Please try again.', { type: 'error' })
		} finally {
			setLoading(false)
		}
	}

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'linear-gradient(135deg, #2e6b55 0%, #235743 100%)',
				padding: 2
			}}
		>
			<Card
				sx={{
					maxWidth: 400,
					width: '100%',
					textAlign: 'center',
					boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
					borderRadius: 3
				}}
			>
				<CardContent sx={{ p: 4 }}>
					<Box sx={{ mb: 3 }}>
						<Box
							component="img"
							src="/logo512.png"
							alt="Valentina Damiano Creazioni"
							sx={{
								width: 140,
								height: 140,
								objectFit: 'contain',
								mb: 2,
								borderRadius: '50%',
								boxShadow: '0 8px 24px rgba(46, 107, 85, 0.18)'
							}}
						/>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
							Admin Panel
						</Typography>
						<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
							Sign in to access the admin panel
						</Typography>
					</Box>

					<Button
						variant="contained"
						size="large"
						fullWidth
						onClick={handleGoogleLogin}
						disabled={loading}
						startIcon={<GoogleIcon />}
						sx={{
							backgroundColor: '#4285f4',
							background: '#4285f4',
							color: 'white',
							padding: '12px 24px',
							fontSize: '1rem',
							fontWeight: 600,
							borderRadius: 2,
							boxShadow: '0 4px 14px 0 rgba(66, 133, 244, 0.25)',
							'&:hover': {
								backgroundColor: '#3367d6',
								background: '#3367d6',
								transform: 'translateY(-2px)',
								boxShadow: '0 8px 25px 0 rgba(66, 133, 244, 0.4)'
							},
							'&:active': {
								transform: 'translateY(0)',
								boxShadow: '0 4px 14px 0 rgba(66, 133, 244, 0.25)'
							}
						}}
					>
						{loading ? 'Signing in...' : 'Sign in with Google'}
					</Button>

					<Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
						Only users with admin privileges can access this panel.
					</Alert>
				</CardContent>
			</Card>
		</Box>
	)
}

export default Login
