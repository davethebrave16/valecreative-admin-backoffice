const BRAND_COLORS = {
	primary: '#2e6b55',
	primaryDark: '#235743',
	bgLight: '#d5ece4',
	bgPage: '#f7fbf9',
	bgPaper: '#f1f8f4',
	textPrimary: '#1a2e27',
	textSecondary: '#3d5a4e',
} as const

const FONT_STACK = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

export type EmailLocale = 'it' | 'en'

const CONTACT_EMAIL = 'info@valentinadamiano.it'

const FOOTER_TEXT: Record<EmailLocale, string> = {
	it: '&copy; Valentina Damiano &mdash; Tutti i diritti riservati.',
	en: '&copy; Valentina Damiano &mdash; All rights reserved.',
}

const TYPE_LABELS: Record<EmailLocale, Record<string, string>> = {
	it: { commission: 'Commissione', course: "Corso d'arte", info: 'Informazioni' },
	en: { commission: 'Commission', course: 'Art course', info: 'Information' },
}

const escapeHtml = (value: string): string =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')

const wrapEmailHtml = (contentHtml: string, locale: EmailLocale = 'it'): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND_COLORS.bgPage};padding:24px 0;font-family:${FONT_STACK};">
	<tr>
		<td align="center">
			<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BRAND_COLORS.bgPaper};border-radius:8px;overflow:hidden;">
				<tr>
					<td align="center" bgcolor="${BRAND_COLORS.primary}" style="background:linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%);padding:24px;">
						<span style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:0.5px;">Valentina Damiano</span>
					</td>
				</tr>
				<tr>
					<td style="padding:32px 24px;color:${BRAND_COLORS.textPrimary};font-size:15px;line-height:1.6;">
						${contentHtml}
					</td>
				</tr>
				<tr>
					<td align="center" bgcolor="${BRAND_COLORS.bgLight}" style="padding:16px 24px;color:${BRAND_COLORS.textSecondary};font-size:12px;">
						${FOOTER_TEXT[locale]}
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>
`.trim()

interface OwnerNotificationParams {
	type: string
	clientName: string
	email: string
	docId: string
	backofficeBaseUrl: string
	phone?: string
}

export const buildOwnerNotificationEmail = (params: OwnerNotificationParams): { subject: string; html: string } => {
	const showUrl = `${params.backofficeBaseUrl}/#/commissions/${params.docId}/show`

	const contentHtml = `
		<h2 style="margin:0 0 16px;color:${BRAND_COLORS.primary};font-size:20px;">Nuova richiesta ricevuta</h2>
		<p style="margin:0 0 8px;"><strong>Tipo:</strong> ${escapeHtml(params.type)}</p>
		<p style="margin:0 0 8px;"><strong>Nome:</strong> ${escapeHtml(params.clientName)}</p>
		<p style="margin:0 0 ${params.phone ? '8px' : '24px'};"><strong>Email:</strong> ${escapeHtml(params.email)}</p>${params.phone ? `
		<p style="margin:0 0 24px;"><strong>Telefono / WhatsApp:</strong> ${escapeHtml(params.phone)}</p>` : ''}
		<table role="presentation" cellpadding="0" cellspacing="0">
			<tr>
				<td align="center" bgcolor="${BRAND_COLORS.primary}" style="border-radius:6px;">
					<a href="${showUrl}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;">Visualizza nel backoffice</a>
				</td>
			</tr>
		</table>
	`

	return {
		subject: 'Nuova richiesta ricevuta',
		html: wrapEmailHtml(contentHtml),
	}
}

interface ConfirmationParams {
	clientName: string
	type: string
	locale?: EmailLocale
}

export const buildConfirmationEmail = (params: ConfirmationParams): { subject: string; html: string } => {
	const locale: EmailLocale = params.locale === 'en' ? 'en' : 'it'
	const name = escapeHtml(params.clientName)
	const typeLabel = escapeHtml(TYPE_LABELS[locale][params.type] ?? params.type)
	const contact = `<a href="mailto:${CONTACT_EMAIL}" style="color:${BRAND_COLORS.primary};">${CONTACT_EMAIL}</a>`

	if (locale === 'en') {
		return {
			subject: 'Your request has arrived',
			html: wrapEmailHtml(`
		<h2 style="margin:0 0 16px;color:${BRAND_COLORS.primary};font-size:20px;">Your request has arrived</h2>
		<p style="margin:0 0 16px;">Hi ${name},</p>
		<p style="margin:0 0 16px;">thank you for writing to me &mdash; your request (${typeLabel}) has arrived. I'll reply personally to this email address within 48 hours, with no obligation.</p>
		<p style="margin:0 0 16px;">If you don't see my reply, please check your spam folder or write to ${contact}.</p>
		<p style="margin:0;color:${BRAND_COLORS.textSecondary};">Warmly,<br/>Valentina</p>
	`, 'en'),
		}
	}

	return {
		subject: 'Ho ricevuto la tua richiesta',
		html: wrapEmailHtml(`
		<h2 style="margin:0 0 16px;color:${BRAND_COLORS.primary};font-size:20px;">Ho ricevuto la tua richiesta</h2>
		<p style="margin:0 0 16px;">Ciao ${name},</p>
		<p style="margin:0 0 16px;">grazie di avermi scritto: la tua richiesta (${typeLabel}) &egrave; arrivata. Ti risponder&ograve; personalmente a questo indirizzo email entro 48 ore, senza alcun impegno.</p>
		<p style="margin:0 0 16px;">Se non trovi la mia risposta, controlla la cartella spam, oppure scrivimi a ${contact}.</p>
		<p style="margin:0;color:${BRAND_COLORS.textSecondary};">A presto,<br/>Valentina</p>
	`, 'it'),
	}
}
