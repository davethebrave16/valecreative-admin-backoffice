import type { DataProvider } from 'react-admin'

// Stub data provider — replace with Firestore implementation when resources are added.
// See wae-admin-backoffice/src/providers/dataProvider.ts for the full reference implementation.
/* eslint-disable @typescript-eslint/no-explicit-any */
const stub = {
	getList: () => Promise.resolve({ data: [], total: 0 }),
	getOne: (_r: string, p: { id: unknown }) => Promise.resolve({ data: { id: p.id } }),
	getMany: (_r: string, p: { ids: unknown[] }) => Promise.resolve({ data: p.ids.map(id => ({ id })) }),
	getManyReference: () => Promise.resolve({ data: [], total: 0 }),
	create: (_r: string, p: { data: Record<string, unknown> }) => Promise.resolve({ data: { ...p.data, id: crypto.randomUUID() } }),
	update: (_r: string, p: { data: Record<string, unknown> }) => Promise.resolve({ data: p.data }),
	updateMany: () => Promise.resolve({ data: [] }),
	delete: (_r: string, p: { id: unknown }) => Promise.resolve({ data: { id: p.id } }),
	deleteMany: (_r: string, p: { ids: unknown[] }) => Promise.resolve({ data: p.ids }),
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const dataProvider = stub as unknown as DataProvider
