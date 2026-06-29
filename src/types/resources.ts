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

export interface ImageObject {
	original: string
	thumb?: string
	medium?: string
	alt?: string
	width?: number
	height?: number
	blurHash?: string
	uploadedAt?: Date | string | number
}

export interface Series extends BaseRecord {
	name: string
	slug: string
	description?: string
	coverImage?: ImageObject
	order?: number
	published: boolean
}

export const SERIES_FIELDS = {
	NAME: 'name',
	SLUG: 'slug',
	DESCRIPTION: 'description',
	COVER_IMAGE: 'coverImage',
	ORDER: 'order',
	PUBLISHED: 'published',
	CREATED_AT: 'createdAt',
	UPDATED_AT: 'updatedAt',
} as const
