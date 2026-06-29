import { Layout as ReactAdminLayout, type LayoutProps, AppBar, TitlePortal, useLogout, useGetIdentity } from 'react-admin'
import { Avatar, Box, Button, Divider, Typography } from '@mui/material'
import { Logout as LogoutIcon } from '@mui/icons-material'
import { APP_VERSION } from '../utils/version'

const CustomAppBar = () => {
	const logout = useLogout()
	const { data: identity } = useGetIdentity()

	const initials = identity?.fullName
		? identity.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
		: '?'

	return (
		<AppBar userMenu={false}>
			<TitlePortal />
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
				<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
					v{APP_VERSION}
				</Typography>
				<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
				<Avatar
					src={identity?.avatar}
					alt={identity?.fullName ?? ''}
					sx={{ width: 32, height: 32, fontSize: '0.8rem', fontWeight: 700, bgcolor: 'rgba(255,255,255,0.2)' }}
				>
					{initials}
				</Avatar>
				{identity?.fullName && (
					<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
						{identity.fullName.split(' ')[0]}
					</Typography>
				)}
				<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
				<Button
					onClick={() => logout()}
					startIcon={<LogoutIcon />}
					size="small"
					sx={{
						color: 'rgba(255,255,255,0.85)',
						fontWeight: 600,
						textTransform: 'none',
						'&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }
					}}
				>
					Logout
				</Button>
			</Box>
		</AppBar>
	)
}

export const Layout = (props: LayoutProps) => (
	<ReactAdminLayout {...props} appBar={CustomAppBar} />
)
