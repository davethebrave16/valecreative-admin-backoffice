import './lib/firebaseAdmin'
import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const recaptchaSecretKey = defineSecret('RECAPTCHA_SECRET_KEY')

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
	{ secrets: ['RECAPTCHA_SECRET_KEY'], region: 'europe-west1' },
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

			return { ok: true }
		} catch (error) {
			if (error instanceof HttpsError) throw error
			console.error(`submitCommission unexpected error (ip=${callerIp}):`, error)
			throw new HttpsError('internal', 'An unexpected error occurred')
		}
	}
)
