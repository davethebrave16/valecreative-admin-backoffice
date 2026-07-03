import type { ReactNode } from 'react'
import { Avatar, Box, Card, CardContent, Divider, Grid, Typography } from '@mui/material'
import { useGetIdentity } from 'react-admin'
import { useDashboardStats } from '../hooks/useDashboardStats'

interface StatCardProps {
	label: string
	value: ReactNode
	caption?: string
	loading?: boolean
}

const StatCard = ({ label, value, caption, loading }: StatCardProps) => (
	<Card sx={{ height: '100%' }}>
		<CardContent sx={{ p: 3 }}>
			<Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.08em' }}>
				{label}
			</Typography>
			<Typography variant="h4" sx={{ mt: 1, fontWeight: 700, color: loading ? 'text.disabled' : 'text.primary' }}>
				{loading ? '—' : value}
			</Typography>
			{caption && (
				<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
					{caption}
				</Typography>
			)}
		</CardContent>
	</Card>
)

const formatLastRequestedAt = (value: Date | string | number | null): string => {
	if (value === null || value === undefined) return 'No commissions yet'
	const date = value instanceof Date ? value : new Date(value)
	if (isNaN(date.getTime())) return 'No commissions yet'
	return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const Dashboard = () => {
	const { data: identity } = useGetIdentity()
	const stats = useDashboardStats()

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

			{/* Commissions stats */}
			<Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
				Commissions
			</Typography>
			<Grid container spacing={3} sx={{ mb: 3 }}>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard label="New Requests" value={stats.newCommissionsCount} loading={stats.isLoading} />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard label="In Progress" value={stats.inProgressCommissionsCount} loading={stats.isLoading} />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard
						label="Closed"
						value={stats.closedCommissionsCount}
						caption="Completed + Declined"
						loading={stats.isLoading}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard
						label="Last Request"
						value={formatLastRequestedAt(stats.lastCommissionRequestedAt)}
						loading={stats.isLoading}
					/>
				</Grid>
			</Grid>

			{/* Artworks stats */}
			<Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
				Artworks
			</Typography>
			<Grid container spacing={3} sx={{ mb: 3 }}>
				<Grid size={{ xs: 12, sm: 6 }}>
					<StatCard label="Total Artworks" value={stats.artworksCount} loading={stats.isLoading} />
				</Grid>
				<Grid size={{ xs: 12, sm: 6 }}>
					<StatCard
						label="Most Used Technique"
						value={stats.mostUsedTechniqueName ?? 'N/A'}
						loading={stats.isLoading}
					/>
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
