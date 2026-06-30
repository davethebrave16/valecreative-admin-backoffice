import {
	List,
	Datagrid,
	TextField,
	EmailField,
	DateField,
	NumberField,
	FunctionField,
	TextInput,
	SelectInput,
} from 'react-admin'
import { Chip } from '@mui/material'
import { COMMISSION_FIELDS, COMMISSION_STATUSES, COMMISSION_STATUS_LABELS } from '../../types'
import type { Commission, CommissionStatus } from '../../types'

const STATUS_CHIP: Record<CommissionStatus, { label: string; color: 'info' | 'warning' | 'success' | 'default' }> = {
	new: { label: 'New', color: 'info' },
	in_progress: { label: 'In Progress', color: 'warning' },
	completed: { label: 'Completed', color: 'success' },
	declined: { label: 'Declined', color: 'default' },
}

const CommissionFilters = [
	<TextInput key="clientName" source={COMMISSION_FIELDS.CLIENT_NAME} label="Client Name" alwaysOn />,
	<SelectInput
		key="status"
		source={COMMISSION_FIELDS.STATUS}
		label="Status"
		choices={COMMISSION_STATUSES.map(s => ({ id: s, name: COMMISSION_STATUS_LABELS[s] }))}
	/>,
]

export const CommissionsList = () => (
	<List
		filters={CommissionFilters}
		actions={false}
		sort={{ field: COMMISSION_FIELDS.REQUESTED_AT, order: 'DESC' }}
	>
		<Datagrid rowClick="show" bulkActionButtons={false}>
			<TextField source={COMMISSION_FIELDS.CLIENT_NAME} label="Client" />
			<EmailField source={COMMISSION_FIELDS.EMAIL} label="Email" />
			<FunctionField<Commission>
				label="Status"
				render={(record) => {
					const cfg = record.status ? STATUS_CHIP[record.status] : null
					return cfg ? <Chip label={cfg.label} color={cfg.color} size="small" /> : '—'
				}}
			/>
			<NumberField
				source={COMMISSION_FIELDS.ESTIMATED_BUDGET}
				label="Budget (€)"
				options={{ style: 'currency', currency: 'EUR' }}
			/>
			<DateField source={COMMISSION_FIELDS.REQUESTED_AT} label="Requested" showTime />
		</Datagrid>
	</List>
)
