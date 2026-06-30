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

export type ArtworkOrigin = 'personal' | 'commissioned'

export const ARTWORK_ORIGIN_LABELS: Record<ArtworkOrigin, string> = {
	personal: 'Personal',
	commissioned: 'Commissioned',
}

export type ArtworkAvailability = 'for_sale' | 'sold' | 'not_for_sale'

export const ARTWORK_AVAILABILITY_LABELS: Record<ArtworkAvailability, string> = {
	for_sale: 'For Sale',
	sold: 'Sold',
	not_for_sale: 'Not for Sale',
}

export interface ArtworkDimensions {
	height: number
	width: number
	unit: string
}

export interface Artwork extends BaseRecord {
	title: string
	slug: string
	year: number
	techniqueId: string
	seriesId?: string
	coverImage?: ImageObject
	origin: ArtworkOrigin
	availability: ArtworkAvailability
	price?: number
	featured: boolean
	dimensions: ArtworkDimensions
	support: string
	description?: string
}

export const ARTWORK_FIELDS = {
	TITLE: 'title',
	SLUG: 'slug',
	YEAR: 'year',
	TECHNIQUE_ID: 'techniqueId',
	SERIES_ID: 'seriesId',
	COVER_IMAGE: 'coverImage',
	ORIGIN: 'origin',
	AVAILABILITY: 'availability',
	PRICE: 'price',
	FEATURED: 'featured',
	DIMENSIONS: 'dimensions',
	DIMENSIONS_HEIGHT: 'dimensions.height',
	DIMENSIONS_WIDTH: 'dimensions.width',
	DIMENSIONS_UNIT: 'dimensions.unit',
	SUPPORT: 'support',
	DESCRIPTION: 'description',
	CREATED_AT: 'createdAt',
	UPDATED_AT: 'updatedAt',
} as const

export interface GalleryImage extends BaseRecord {
	original: string
	thumb?: string
	medium?: string
	alt?: string
	width?: number
	height?: number
	blurHash?: string
	caption?: string
	order?: number
	uploadedAt?: Date | string | number
}

export const GALLERY_IMAGE_FIELDS = {
	ORIGINAL: 'original',
	ALT: 'alt',
	CAPTION: 'caption',
	ORDER: 'order',
	WIDTH: 'width',
	HEIGHT: 'height',
	BLUR_HASH: 'blurHash',
	UPLOADED_AT: 'uploadedAt',
} as const

export interface Content extends BaseRecord {
	slug: string
	title: string
	body: string
	published: boolean
	image?: ImageObject
}

export const CONTENT_FIELDS = {
	SLUG: 'slug',
	TITLE: 'title',
	BODY: 'body',
	PUBLISHED: 'published',
	IMAGE: 'image',
	CREATED_AT: 'createdAt',
	UPDATED_AT: 'updatedAt',
} as const
