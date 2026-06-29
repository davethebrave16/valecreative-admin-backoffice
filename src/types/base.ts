import type { RaRecord } from 'react-admin'

export interface TimestampFields {
	createdAt?: Date | string | number
	updatedAt?: Date | string | number
}

export interface AdminTrackingFields {
	createdByAdmin?: string
	updatedByAdmin?: string
}

export interface BaseRecord extends RaRecord, TimestampFields, AdminTrackingFields {}
