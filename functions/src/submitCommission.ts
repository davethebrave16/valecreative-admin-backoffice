import './lib/firebaseAdmin'
import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { sendEmail } from './lib/brevo'
import { buildOwnerNotificationEmail, buildConfirmationEmail } from './lib/emailTemplates'

const recaptchaSecretKey = defineSecret('RECAPTCHA_SECRET_KEY')
const brevoApiKey = defineSecret('BREVO_API_KEY')

const backofficeBaseUrl = process.env.BACKOFFICE_BASE_URL ?? ''
const emailSenderAddress = process.env.EMAIL_SENDER_ADDRESS ?? ''
const ownerNotificationEmail = process.env.OWNER_NOTIFICATION_EMAIL ?? ''

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_TYPES = ['commission', 'course', 'info'] as const
type SubmissionType = (typeof VALID_TYPES)[number]

interface SubmitCommissionData {
	recaptchaToken?: string
	type?: string
	clientName?: string
	email?: string
	phone?: string
	description?: string
	subject?: string
	preferredTechnique?: string
	desiredDimensions?: string
	estimatedBudget?: number
	courseType?: string
	availability?: string
	honeypot?: string
}

interface RecaptchaVerifyResponse {
	success: boolean
	score?: number
	'error-codes'?: string[]
}

const stripHtml = (value: string): string => value.replace(/<[^>]*>/g, '')

const rejectInvalid = (reason: string): never => {
	console.warn(`submitCommission validation failed: ${reason}`)
	throw new HttpsError('invalid-argument', reason)
}

const validateInput = (data: SubmitCommissionData): void => {
	if (!data.type || !VALID_TYPES.includes(data.type as SubmissionType)) {
		rejectInvalid(`Invalid submission type: ${data.type ?? '(missing)'}`)
	}

	const clientName = data.clientName?.trim() ?? ''
	if (!clientName || clientName.length > 100) {
		rejectInvalid(`Invalid client name (length=${clientName.length})`)
	}

	const email = data.email?.trim() ?? ''
	if (!email || !EMAIL_REGEX.test(email) || email.length > 200) {
		rejectInvalid('Invalid email address')
	}

	if (data.description && data.description.length > 3000) {
		rejectInvalid(`Description is too long (length=${data.description.length})`)
	}

	if (data.subject && data.subject.length > 500) {
		rejectInvalid(`Subject is too long (length=${data.subject.length})`)
	}

	if (data.estimatedBudget !== undefined && (typeof data.estimatedBudget !== 'number' || data.estimatedBudget <= 0)) {
		rejectInvalid(`Invalid estimated budget: ${data.estimatedBudget}`)
	}
}

const buildCommissionDoc = (data: SubmitCommissionData): Record<string, unknown> => {
	const clientName = stripHtml(data.clientName!.trim())
	const email = stripHtml(data.email!.trim())

	const doc: Record<string, unknown> = {
		type: data.type,
		clientName,
		email,
		status: 'new',
		requestedAt: FieldValue.serverTimestamp(),
	}

	const phone = data.phone?.trim()
	if (phone) doc.phone = phone

	const description = data.description ? stripHtml(data.description.trim()) : ''
	if (description) doc.description = description

	const subject = data.subject ? stripHtml(data.subject.trim()) : ''
	if (subject) doc.subject = subject

	const preferredTechnique = data.preferredTechnique?.trim()
	if (preferredTechnique) doc.preferredTechnique = preferredTechnique

	const desiredDimensions = data.desiredDimensions?.trim()
	if (desiredDimensions) doc.desiredDimensions = desiredDimensions

	if (data.estimatedBudget !== undefined) doc.estimatedBudget = data.estimatedBudget

	const courseType = data.courseType?.trim()
	if (courseType) doc.courseType = courseType

	const availability = data.availability ? stripHtml(data.availability.trim()) : ''
	if (availability) doc.availability = availability

	return doc
}

export const submitCommission = onCall(
	{ secrets: ['RECAPTCHA_SECRET_KEY', 'BREVO_API_KEY'], region: 'europe-west1' },
	async (request: CallableRequest<SubmitCommissionData>) => {
		const data = request.data
		const callerIp = request.rawRequest?.ip ?? 'unknown'

		console.log(`submitCommission invoked — type=${data.type ?? '(missing)'} ip=${callerIp} hasRecaptchaToken=${Boolean(data.recaptchaToken)}`)

		if (data.honeypot && data.honeypot.trim().length > 0) {
			console.warn(`submitCommission honeypot triggered — discarding silently (ip=${callerIp})`)
			return { ok: true }
		}

		try {
			const params = new URLSearchParams({
				secret: recaptchaSecretKey.value(),
				response: data.recaptchaToken ?? '',
			})

			const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: params.toString(),
			})

			if (!recaptchaResponse.ok) {
				console.error(`submitCommission reCAPTCHA HTTP error: status=${recaptchaResponse.status}`)
			}

			const recaptchaResult = await recaptchaResponse.json() as RecaptchaVerifyResponse
			console.log(`submitCommission reCAPTCHA score=${recaptchaResult.score ?? 'n/a'} success=${recaptchaResult.success}`)

			if (!recaptchaResult.success || (recaptchaResult.score ?? 0) < 0.5) {
				console.warn(`submitCommission reCAPTCHA rejected — errorCodes=${JSON.stringify(recaptchaResult['error-codes'] ?? [])} score=${recaptchaResult.score ?? 'n/a'} ip=${callerIp}`)
				throw new HttpsError('permission-denied', 'reCAPTCHA verification failed')
			}

			validateInput(data)

			const doc = buildCommissionDoc(data)
			const writeResult = await getFirestore().collection('commissions').add(doc)
			console.log(`submitCommission wrote new ${doc.type} document — id=${writeResult.id}`)

			try {
				const clientName = doc.clientName as string
				const clientEmail = doc.email as string
				const type = doc.type as string

				console.log(`submitCommission sending emails — docId=${writeResult.id} clientName=${clientName} clientEmail=${clientEmail}`)

				const emailsToSend: { label: string; promise: Promise<void> }[] = []

				if (ownerNotificationEmail) {
					const owner = buildOwnerNotificationEmail({
						type,
						clientName,
						email: clientEmail,
						docId: writeResult.id,
						backofficeBaseUrl,
					})
					emailsToSend.push({
						label: 'owner-notification',
						promise: sendEmail({
							sender: { email: emailSenderAddress, name: 'Valentina Damiano' },
							to: [{ email: ownerNotificationEmail }],
							subject: owner.subject,
							htmlContent: owner.html,
						}, brevoApiKey.value()),
					})
				} else {
					console.warn('submitCommission skipping owner notification email — OWNER_NOTIFICATION_EMAIL is not configured')
				}

				const confirmation = buildConfirmationEmail({ clientName, type })
				emailsToSend.push({
					label: 'requester-confirmation',
					promise: sendEmail({
						sender: { email: emailSenderAddress, name: 'Valentina Damiano' },
						to: [{ email: clientEmail, name: clientName }],
						subject: confirmation.subject,
						htmlContent: confirmation.html,
					}, brevoApiKey.value()),
				})

				const results = await Promise.allSettled(emailsToSend.map((entry) => entry.promise))
				results.forEach((result, index) => {
					const { label } = emailsToSend[index]
					if (result.status === 'rejected') {
						console.error(`submitCommission email send failed (label=${label}, docId=${writeResult.id}, clientName=${clientName}, clientEmail=${clientEmail}, ip=${callerIp}):`, result.reason)
					} else {
						console.log(`submitCommission email sent successfully (label=${label}, docId=${writeResult.id}, clientName=${clientName}, clientEmail=${clientEmail})`)
					}
				})
			} catch (emailError) {
				console.error(`submitCommission unexpected error while sending emails (docId=${writeResult.id}, ip=${callerIp}):`, emailError)
			}

			console.log(`submitCommission completed successfully — docId=${writeResult.id} type=${doc.type}`)

			return { ok: true }
		} catch (error) {
			if (error instanceof HttpsError) throw error
			console.error(`submitCommission unexpected error (ip=${callerIp}):`, error)
			throw new HttpsError('internal', 'An unexpected error occurred')
		}
	}
)
