import { Avatar, Box, Card, CardContent, Divider, Grid, Typography } from '@mui/material'
import { useGetIdentity } from 'react-admin'

const StatCard = ({ label }: { label: string }) => (
	<Card sx={{ height: '100%' }}>
		<CardContent sx={{ p: 3 }}>
			<Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.08em' }}>
				{label}
			</Typography>
			<Typography variant="h4" sx={{ mt: 1, fontWeight: 700, color: 'text.disabled' }}>
				—
			</Typography>
			<Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
				Coming soon
			</Typography>
		</CardContent>
	</Card>
)

const Dashboard = () => {
	const { data: identity } = useGetIdentity()

	const initials = identity?.fullName
		? identity.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
		: 'VC'

	return (
		<Box sx={{ p: 3 }}>
			{/* Page title row */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
				<Avatar
					src={identity?.avatar}
					alt={identity?.fullName ?? 'Admin'}
					sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontWeight: 700 }}
				>
					{initials}
				</Avatar>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
						{identity?.fullName ? `Welcome, ${identity.fullName.split(' ')[0]}` : 'Dashboard'}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Vale Creative Admin Panel
					</Typography>
				</Box>
			</Box>

			<Divider sx={{ mb: 3 }} />

			{/* Stat placeholder cards */}
			<Grid container spacing={3} sx={{ mb: 3 }}>
				<Grid size={{ xs: 12, sm: 4 }}>
					<StatCard label="Stat A" />
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<StatCard label="Stat B" />
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<StatCard label="Stat C" />
				</Grid>
			</Grid>

			{/* Info card */}
			<Card>
				<CardContent sx={{ p: 3 }}>
					<Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
						Getting Started
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Use the sidebar to navigate resources. More sections will appear here as the panel is built out.
					</Typography>
				</CardContent>
			</Card>
		</Box>
	)
}

export default Dashboard
