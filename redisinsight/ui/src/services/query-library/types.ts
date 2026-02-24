export enum QueryLibraryType {
  Sample = 'SAMPLE',
  Saved = 'SAVED',
}

export interface QueryLibraryItem {
  id: string
  databaseId: string
  indexName: string
  type: QueryLibraryType
  name: string
  description?: string
  query: string
  createdAt: string
  updatedAt: string
}

export type CreateQueryLibraryItem = Pick<
  QueryLibraryItem,
  'indexName' | 'name' | 'query'
>

export type UpdateQueryLibraryItem = Partial<
  Pick<QueryLibraryItem, 'name' | 'description' | 'query'>
>

export type SeedQueryLibraryItem = Pick<
  QueryLibraryItem,
  'indexName' | 'name' | 'query'
> & { description?: string }

export interface QueryLibraryFilter {
  indexName: string
  search?: string
}
