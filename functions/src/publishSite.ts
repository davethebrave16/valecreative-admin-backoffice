import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'

const githubToken = defineSecret('GITHUB_DISPATCH_TOKEN')

const GITHUB_OWNER = process.env.GITHUB_OWNER ?? ''
const GITHUB_REPO = process.env.GITHUB_REPO ?? ''

export const publishSite = onCall(
	{ secrets: ['GITHUB_DISPATCH_TOKEN'], region: 'europe-west1' },
	async (request: CallableRequest) => {
		if (!request.auth?.token?.admin) {
			throw new HttpsError('permission-denied', 'Admin only')
		}

		const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${githubToken.value()}`,
				'Accept': 'application/vnd.github+json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ event_type: 'publish-site' }),
		})

		if (response.status !== 204) {
			throw new HttpsError('internal', `GitHub API error: ${response.status}`)
		}

		return { ok: true }
	}
)
