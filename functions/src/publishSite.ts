import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'

const githubToken = defineSecret('GITHUB_DISPATCH_TOKEN')

const GITHUB_OWNER = process.env.GITHUB_OWNER ?? ''
const GITHUB_REPO = process.env.GITHUB_REPO ?? ''

export const publishSite = onCall(
	{ secrets: ['GITHUB_DISPATCH_TOKEN'], region: 'europe-west1' },
	async (request: CallableRequest) => {
		const callerUid = request.auth?.uid ?? 'unauthenticated'
		const callerEmail = request.auth?.token?.email ?? 'unknown'
		console.log(`publishSite called by uid=${callerUid} email=${callerEmail}`)

		if (!request.auth?.token?.admin) {
			console.warn(`publishSite denied — uid=${callerUid} does not have admin claim`)
			throw new HttpsError('permission-denied', 'Admin only')
		}

		const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`
		console.log(`Dispatching repository_dispatch to ${url}`)

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${githubToken.value()}`,
				'Accept': 'application/vnd.github+json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ event_type: 'publish-site' }),
		})

		console.log(`GitHub API responded with status ${response.status}`)

		if (response.status !== 204) {
			const body = await response.text()
			console.error(`GitHub API error ${response.status}:`, body)
			throw new HttpsError('internal', `GitHub API error: ${response.status}`)
		}

		console.log('repository_dispatch sent successfully — site build triggered')
		return { ok: true }
	}
)
