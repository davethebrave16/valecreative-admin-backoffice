import { auth } from '../firebase'

export const getCurrentAdminEmail = (): string =>
	auth.currentUser?.email ?? 'unknown@admin.com'
