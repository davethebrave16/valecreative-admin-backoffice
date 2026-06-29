import type { AuthProvider } from 'react-admin'
import {
	signInWithPopup,
	signOut,
	onAuthStateChanged,
	getIdTokenResult,
	type User
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const hasAdminClaim = async (user: User): Promise<boolean> => {
	try {
		const idTokenResult = await getIdTokenResult(user, true)
		const claims = idTokenResult.claims
		return Boolean(claims?.admin)
	} catch (error) {
		console.error('Error checking admin claim:', error)
		return false
	}
}

export const authProvider: AuthProvider = {
	login: async () => {
		try {
			const result = await signInWithPopup(auth, googleProvider)
			const user = result.user

			const isAdmin = await hasAdminClaim(user)
			if (!isAdmin) {
				await signOut(auth)
				throw new Error('User does not have admin privileges')
			}

			return Promise.resolve()
		} catch (error) {
			console.error('Authentication failed:', error)
			throw new Error('Authentication failed')
		}
	},

	logout: async () => {
		try {
			await signOut(auth)
			return Promise.resolve()
		} catch (error) {
			console.error('Logout failed:', error)
			throw new Error('Logout failed')
		}
	},

	checkAuth: () => {
		return new Promise((resolve, reject) => {
			onAuthStateChanged(auth, async (user) => {
				if (user) {
					const isAdmin = await hasAdminClaim(user)
					if (isAdmin) {
						resolve()
					} else {
						reject()
					}
				} else {
					reject()
				}
			})
		})
	},

	checkError: (error) => {
		const status = (error as { status?: number }).status
		if (status === 401 || status === 403) {
			return Promise.reject()
		}
		return Promise.resolve()
	},

	getIdentity: () => {
		return new Promise((resolve, reject) => {
			onAuthStateChanged(auth, async (user) => {
				if (user) {
					const isAdmin = await hasAdminClaim(user)
					if (isAdmin) {
						resolve({
							id: user.uid,
							fullName: user.displayName || user.email || 'User',
							avatar: user.photoURL || undefined
						})
					} else {
						reject()
					}
				} else {
					reject()
				}
			})
		})
	},

	getPermissions: () => Promise.resolve('admin')
}
