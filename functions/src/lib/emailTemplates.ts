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

const wrapEmailHtml = (contentHtml: string): string => `
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
						&copy; Valentina Damiano &mdash; Tutti i diritti riservati.
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
}

export const buildOwnerNotificationEmail = (params: OwnerNotificationParams): { subject: string; html: string } => {
	const showUrl = `${params.backofficeBaseUrl}/#/commissions/${params.docId}/show`

	const contentHtml = `
		<h2 style="margin:0 0 16px;color:${BRAND_COLORS.primary};font-size:20px;">Nuova richiesta ricevuta</h2>
		<p style="margin:0 0 8px;"><strong>Tipo:</strong> ${params.type}</p>
		<p style="margin:0 0 8px;"><strong>Nome:</strong> ${params.clientName}</p>
		<p style="margin:0 0 24px;"><strong>Email:</strong> ${params.email}</p>
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
}

export const buildConfirmationEmail = (params: ConfirmationParams): { subject: string; html: string } => {
	const contentHtml = `
		<h2 style="margin:0 0 16px;color:${BRAND_COLORS.primary};font-size:20px;">Abbiamo ricevuto la tua richiesta</h2>
		<p style="margin:0 0 16px;">Ciao ${params.clientName},</p>
		<p style="margin:0 0 16px;">grazie per averci contattato. Abbiamo ricevuto la tua richiesta (${params.type}) e ti risponderemo al più presto.</p>
		<p style="margin:0;color:${BRAND_COLORS.textSecondary};">A presto,<br/>Valentina Damiano</p>
	`

	return {
		subject: 'Abbiamo ricevuto la tua richiesta',
		html: wrapEmailHtml(contentHtml),
	}
}
