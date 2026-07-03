export interface BrevoRecipient {
	email: string
	name?: string
}

export interface BrevoEmailPayload {
	sender: BrevoRecipient
	to: BrevoRecipient[]
	subject: string
	htmlContent: string
}

export const sendEmail = async (payload: BrevoEmailPayload, apiKey: string): Promise<void> => {
	const response = await fetch('https://api.brevo.com/v3/smtp/email', {
		method: 'POST',
		headers: {
			'api-key': apiKey,
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify(payload),
	})

	if (!response.ok) {
		const body = await response.text()
		throw new Error(`Brevo API error: ${response.status} ${body}`)
	}
}
