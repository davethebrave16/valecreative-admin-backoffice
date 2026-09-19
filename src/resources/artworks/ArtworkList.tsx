import { useState } from 'react'
import {
	List,
	Datagrid,
	TextField,
	DateField,
	NumberField,
	FunctionField,
	TopToolbar,
	CreateButton,
	FilterButton,
	TextInput,
	ReferenceInput,
	SelectInput,
	useListContext,
} from 'react-admin'
import { Chip, Tabs, Tab, Button } from '@mui/material'
import SortIcon from '@mui/icons-material/Sort'
import { ARTWORK_FIELDS } from '../../types'
import type { Artwork, ArtworkOrigin, ArtworkAvailability } from '../../types'
import { SortArtworksModal } from '../../components/SortArtworksModal'

const ORIGIN_CHIP: Record<ArtworkOrigin, { label: string; color: 'default' | 'secondary' }> = {
	personal: { label: 'Personal', color: 'default' },
	commissioned: { label: 'Commissioned', color: 'secondary' },
}

const AVAILABILITY_CHIP: Record<ArtworkAvailability, { label: string; color: 'success' | 'default' | 'warning' }> = {
	for_sale: { label: 'For Sale', color: 'success' },
	sold: { label: 'Sold', color: 'default' },
	not_for_sale: { label: 'Not for Sale', color: 'warning' },
}

const ArtworkTabs = () => {
	const { filterValues, setFilters } = useListContext()
	const current: string = filterValues.featured === true ? 'featured' : (filterValues.origin ?? '')
	const handleChange = (_: React.SyntheticEvent, value: string) => {
		const next = { ...filterValues }
		delete next.featured
		delete next.origin
		if (value === 'featured') {
			next.featured = true
		} else if (value) {
			next.origin = value
		}
		setFilters(next, [])
	}
	return (
		<Tabs value={current} onChange={handleChange} sx={{ mb: 1 }}>
			<Tab label="All" value="" />
			<Tab label="Personal" value="personal" />
			<Tab label="Commissioned" value="commissioned" />
			<Tab label="Featured" value="featured" />
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
	<ReferenceInput key="categoryIds" source={ARTWORK_FIELDS.CATEGORY_IDS} reference="categories">
		<SelectInput label="Category" optionText="name" />
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
	<SelectInput
		key="isHero"
		source={ARTWORK_FIELDS.IS_HERO}
		label="Homepage Hero"
		choices={[
			{ id: true, name: 'Yes' },
			{ id: false, name: 'No' },
		]}
	/>,
	<SelectInput
		key="isIntro"
		source={ARTWORK_FIELDS.IS_INTRO}
		label="Homepage Intro Image"
		choices={[
			{ id: true, name: 'Yes' },
			{ id: false, name: 'No' },
		]}
	/>,
	<SelectInput
		key="showOnAboutPage"
		source={ARTWORK_FIELDS.SHOW_ON_ABOUT_PAGE}
		label="Show on About Page"
		choices={[
			{ id: true, name: 'Yes' },
			{ id: false, name: 'No' },
		]}
	/>,
]

const ListActions = ({ onSort }: { onSort: () => void }) => (
	<TopToolbar>
		<FilterButton />
		<Button startIcon={<SortIcon />} onClick={onSort} variant="outlined" size="small">
			Sort
		</Button>
		<CreateButton />
	</TopToolbar>
)

export const ArtworkList = () => {
	const [sortModalOpen, setSortModalOpen] = useState(false)

	return (
		<List
			filters={ArtworkFilters}
			actions={<ListActions onSort={() => setSortModalOpen(true)} />}
			sort={{ field: ARTWORK_FIELDS.CREATED_AT, order: 'DESC' }}
		>
			<>
				<ArtworkTabs />
				<SortArtworksModal open={sortModalOpen} onClose={() => setSortModalOpen(false)} />
				<Datagrid rowClick="show" bulkActionButtons={false}>
					<FunctionField<Artwork>
						label=""
						render={(record) =>
							record.coverImage?.thumb || record.coverImage?.original ? (
								<img
									src={record.coverImage.thumb ?? record.coverImage.original}
									alt={record.coverImage.alt ?? ''}
									style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, display: 'block' }}
								/>
							) : (
								<div style={{ width: 48, height: 48, borderRadius: 4, background: '#e0e0e0' }} />
							)
						}
					/>
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
						render={(record) => (
							<>
								{record.isHero && <Chip label="Hero" color="secondary" size="small" sx={{ mr: 0.5 }} />}
								{record.isIntro && <Chip label="Intro" color="info" size="small" sx={{ mr: 0.5 }} />}
								{record.showOnAboutPage && <Chip label="About" color="default" size="small" sx={{ mr: record.featured ? 0.5 : 0 }} />}
								{record.featured && <Chip label="Featured" color="primary" size="small" />}
							</>
						)}
					/>
					<DateField source={ARTWORK_FIELDS.CREATED_AT} label="Created" />
				</Datagrid>
			</>
		</List>
	)
}
