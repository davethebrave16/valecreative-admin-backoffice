import type { BaseRecord } from './base'

export type TechniqueCategory = 'painting' | 'engraving' | 'craft' | 'other'

export const TECHNIQUE_CATEGORIES: TechniqueCategory[] = ['painting', 'engraving', 'craft', 'other']

export const TECHNIQUE_CATEGORY_LABELS: Record<TechniqueCategory, string> = {
	painting: 'Pittura',
	engraving: 'Incisione',
	craft: 'Artigianato',
	other: 'Altro',
}

export interface Technique extends BaseRecord {
	name: string
	slug: string
	description?: string
	category: TechniqueCategory
}

export const TECHNIQUE_FIELDS = {
	NAME: 'name',
	SLUG: 'slug',
	DESCRIPTION: 'description',
	CATEGORY: 'category',
	CREATED_AT: 'createdAt',
	UPDATED_AT: 'updatedAt',
} as const
