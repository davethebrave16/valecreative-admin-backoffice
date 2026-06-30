import {
	Show,
	SimpleShowLayout,
	TextField,
	EmailField,
	DateField,
	NumberField,
	FunctionField,
	TopToolbar,
	EditButton,
	Labeled,
} from 'react-admin'
import { Chip, Divider, Typography } from '@mui/material'
import { COMMISSION_FIELDS, COMMISSION_STATUS_LABELS } from '../../types'
import type { Commission, CommissionStatus } from '../../types'

const STATUS_CHIP: Record<CommissionStatus, { label: string; color: 'info' | 'warning' | 'success' | 'default' }> = {
	new: { label: 'New', color: 'info' },
	in_progress: { label: 'In Progress', color: 'warning' },
	completed: { label: 'Completed', color: 'success' },
	declined: { label: 'Declined', color: 'default' },
}

const CommissionsShowActions = () => (
	<TopToolbar>
		<EditButton />
	</TopToolbar>
)

export const CommissionsShow = () => (
	<Show actions={<CommissionsShowActions />}>
		<SimpleShowLayout>
			<Typography variant="subtitle2" color="textSecondary">Client Info</Typography>

			<TextField source={COMMISSION_FIELDS.CLIENT_NAME} label="Client Name" />
			<EmailField source={COMMISSION_FIELDS.EMAIL} label="Email" />
			<TextField source={COMMISSION_FIELDS.PHONE} label="Phone" emptyText="—" />
			<TextField source={COMMISSION_FIELDS.DESCRIPTION} label="Description" />
			<NumberField
				source={COMMISSION_FIELDS.ESTIMATED_BUDGET}
				label="Estimated Budget"
				options={{ style: 'currency', currency: 'EUR' }}
				emptyText="—"
			/>
			<DateField source={COMMISSION_FIELDS.REQUESTED_AT} label="Requested At" showTime />

			<Divider sx={{ my: 2 }} />
			<Typography variant="subtitle2" color="textSecondary">Internal</Typography>

			<Labeled label="Status">
				<FunctionField<Commission>
					render={(record) => {
						const cfg = record.status ? STATUS_CHIP[record.status] : null
						return cfg ? (
							<Chip label={cfg.label} color={cfg.color} size="small" />
						) : (
							<span>{COMMISSION_STATUS_LABELS[record.status] ?? record.status}</span>
						)
					}}
				/>
			</Labeled>
			<TextField source={COMMISSION_FIELDS.NOTES} label="Notes" emptyText="—" />
			<DateField source={COMMISSION_FIELDS.UPDATED_AT} label="Updated At" showTime />
		</SimpleShowLayout>
	</Show>
)
