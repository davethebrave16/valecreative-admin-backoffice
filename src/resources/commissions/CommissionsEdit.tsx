import {
	Edit,
	SimpleForm,
	TextInput,
	SelectInput,
	SaveButton,
	Toolbar,
	TextField,
	EmailField,
	DateField,
	NumberField,
	Labeled,
	required,
} from 'react-admin'
import { Divider, Typography } from '@mui/material'
import { COMMISSION_FIELDS, COMMISSION_STATUSES, COMMISSION_STATUS_LABELS } from '../../types'

const statusChoices = COMMISSION_STATUSES.map(s => ({ id: s, name: COMMISSION_STATUS_LABELS[s] }))

const CommissionsEditToolbar = () => (
	<Toolbar>
		<SaveButton />
	</Toolbar>
)

export const CommissionsEdit = () => (
	<Edit title="Edit Commission">
		<SimpleForm toolbar={<CommissionsEditToolbar />}>
			<Typography variant="subtitle2" color="textSecondary">Client Info (read-only)</Typography>

			<Labeled label="Client Name" fullWidth>
				<TextField source={COMMISSION_FIELDS.CLIENT_NAME} />
			</Labeled>
			<Labeled label="Email" fullWidth>
				<EmailField source={COMMISSION_FIELDS.EMAIL} />
			</Labeled>
			<Labeled label="Phone" fullWidth>
				<TextField source={COMMISSION_FIELDS.PHONE} emptyText="—" />
			</Labeled>
			<Labeled label="Description" fullWidth>
				<TextField source={COMMISSION_FIELDS.DESCRIPTION} />
			</Labeled>
			<Labeled label="Estimated Budget" fullWidth>
				<NumberField
					source={COMMISSION_FIELDS.ESTIMATED_BUDGET}
					options={{ style: 'currency', currency: 'EUR' }}
					emptyText="—"
				/>
			</Labeled>
			<Labeled label="Requested At" fullWidth>
				<DateField source={COMMISSION_FIELDS.REQUESTED_AT} showTime />
			</Labeled>

			<Divider sx={{ my: 2, width: '100%' }} />
			<Typography variant="subtitle2" color="textSecondary">Internal</Typography>

			<SelectInput
				source={COMMISSION_FIELDS.STATUS}
				label="Status"
				choices={statusChoices}
				validate={[required()]}
				fullWidth
			/>
			<TextInput
				source={COMMISSION_FIELDS.NOTES}
				label="Notes"
				multiline
				rows={4}
				fullWidth
			/>
		</SimpleForm>
	</Edit>
)
