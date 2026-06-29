import {
	List,
	Datagrid,
	TextField,
	DateField,
	NumberField,
	FunctionField,
	TopToolbar,
	CreateButton,
	TextInput,
	ReferenceInput,
	SelectInput,
	useListContext,
} from 'react-admin'
import { Chip, Tabs, Tab } from '@mui/material'
import { ARTWORK_FIELDS } from '../../types'
import type { Artwork, ArtworkOrigin, ArtworkAvailability } from '../../types'

const ORIGIN_CHIP: Record<ArtworkOrigin, { label: string; color: 'default' | 'secondary' }> = {
	personal: { label: 'Personal', color: 'default' },
	commissioned: { label: 'Commissioned', color: 'secondary' },
}

const AVAILABILITY_CHIP: Record<ArtworkAvailability, { label: string; color: 'success' | 'default' | 'warning' }> = {
	for_sale: { label: 'For Sale', color: 'success' },
	sold: { label: 'Sold', color: 'default' },
	not_for_sale: { label: 'Not for Sale', color: 'warning' },
}

const OriginTabs = () => {
	const { filterValues, setFilters } = useListContext()
	const current: string = filterValues.origin ?? ''
	const handleChange = (_: React.SyntheticEvent, value: string) => {
		const next = { ...filterValues }
		if (value) {
			next.origin = value
		} else {
			delete next.origin
		}
		setFilters(next, [])
	}
	return (
		<Tabs value={current} onChange={handleChange} sx={{ mb: 1 }}>
			<Tab label="All" value="" />
			<Tab label="Personal" value="personal" />
			<Tab label="Commissioned" value="commissioned" />
		</Tabs>
	)
}

const ArtworkFilters = [
	<TextInput key="title" source={ARTWORK_FIELDS.TITLE} label="Title" alwaysOn />,
	<ReferenceInput key="techniqueId" source={ARTWORK_FIELDS.TECHNIQUE_ID} reference="techniques">
		<SelectInput label="Technique" optionText="name" />
	</ReferenceInput>,
	<ReferenceInput key="seriesId" source={ARTWORK_FIELDS.SERIES_ID} reference="series">
		<SelectInput label="Series" optionText="name" />
	</ReferenceInput>,
	<SelectInput
		key="availability"
		source={ARTWORK_FIELDS.AVAILABILITY}
		label="Availability"
		choices={[
			{ id: 'for_sale', name: 'For Sale' },
			{ id: 'sold', name: 'Sold' },
			{ id: 'not_for_sale', name: 'Not for Sale' },
		]}
	/>,
	<SelectInput
		key="featured"
		source={ARTWORK_FIELDS.FEATURED}
		label="Featured"
		choices={[
			{ id: true, name: 'Yes' },
			{ id: false, name: 'No' },
		]}
	/>,
]

const ListActions = () => (
	<TopToolbar>
		<CreateButton />
	</TopToolbar>
)

export const ArtworkList = () => (
	<List
		filters={ArtworkFilters}
		actions={<ListActions />}
		sort={{ field: ARTWORK_FIELDS.CREATED_AT, order: 'DESC' }}
	>
		<>
			<OriginTabs />
			<Datagrid rowClick="show" bulkActionButtons={false}>
				<TextField source={ARTWORK_FIELDS.TITLE} label="Title" />
				<TextField source={ARTWORK_FIELDS.SLUG} label="Slug" />
				<NumberField source={ARTWORK_FIELDS.YEAR} label="Year" />
				<FunctionField<Artwork>
					label="Origin"
					render={(record) => {
						const cfg = record.origin ? ORIGIN_CHIP[record.origin] : null
						return cfg ? <Chip label={cfg.label} color={cfg.color} size="small" /> : '—'
					}}
				/>
				<FunctionField<Artwork>
					label="Availability"
					render={(record) => {
						const cfg = record.availability ? AVAILABILITY_CHIP[record.availability] : null
						return cfg ? <Chip label={cfg.label} color={cfg.color} size="small" /> : '—'
					}}
				/>
				<FunctionField<Artwork>
					label="Featured"
					render={(record) =>
						record.featured ? <Chip label="Featured" color="primary" size="small" /> : null
					}
				/>
				<DateField source={ARTWORK_FIELDS.CREATED_AT} label="Created" />
			</Datagrid>
		</>
	</List>
)
