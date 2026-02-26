import {
  QueryLibraryItem,
  CreateQueryLibraryItem,
  UpdateQueryLibraryItem,
  SeedQueryLibraryItem,
  QueryLibraryFilter,
} from '../types'

export interface QueryLibraryResult {
  success: boolean
  data?: QueryLibraryItem[]
  error?: Error
}

export interface QueryLibraryItemResult {
  success: boolean
  data?: QueryLibraryItem
  error?: Error
}

export interface QueryLibraryDatabase {
  getList(
    databaseId: string,
    filter: QueryLibraryFilter,
  ): Promise<QueryLibraryResult>

  getOne(databaseId: string, id: string): Promise<QueryLibraryItemResult>

  create(
    databaseId: string,
    data: CreateQueryLibraryItem,
  ): Promise<QueryLibraryItemResult>

  update(
    databaseId: string,
    id: string,
    data: UpdateQueryLibraryItem,
  ): Promise<QueryLibraryItemResult>

  delete(databaseId: string, id: string): Promise<QueryLibraryResult>

  seed(
    databaseId: string,
    items: SeedQueryLibraryItem[],
  ): Promise<QueryLibraryResult>
}
