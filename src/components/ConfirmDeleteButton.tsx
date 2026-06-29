import { DeleteButton } from 'react-admin'

export const ConfirmDeleteButton = () => (
	<DeleteButton
		mutationMode="pessimistic"
		confirmTitle="Delete record"
		confirmContent="This action cannot be undone. Are you sure you want to delete this record?"
	/>
)
