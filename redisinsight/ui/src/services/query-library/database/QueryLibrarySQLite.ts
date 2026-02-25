import apiService from 'uiSrc/services/apiService'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl, isStatusSuccessful } from 'uiSrc/utils'
import {
  QueryLibraryItem,
  CreateQueryLibraryItem,
  UpdateQueryLibraryItem,
  SeedQueryLibraryItem,
  QueryLibraryFilter,
} from '../types'
import {
  QueryLibraryDatabase,
  QueryLibraryResult,
  QueryLibraryItemResult,
} from './interface'

export class QueryLibrarySQLite implements QueryLibraryDatabase {
  async getList(
    databaseId: string,
    filter: QueryLibraryFilter,
  ): Promise<QueryLibraryResult> {
    try {
      const url = getUrl(databaseId, ApiEndpoints.QUERY_LIBRARY)
      const { data, status } = await apiService.get<QueryLibraryItem[]>(url, {
        params: filter,
      })

      if (isStatusSuccessful(status)) {
        return { success: true, data }
      }

      return { success: false }
    } catch (exception) {
      return { success: false, error: exception as Error }
    }
  }

  async getOne(
    databaseId: string,
    id: string,
  ): Promise<QueryLibraryItemResult> {
    try {
      const url = getUrl(databaseId, ApiEndpoints.QUERY_LIBRARY, id)
      const { data, status } = await apiService.get<QueryLibraryItem>(url)

      if (isStatusSuccessful(status)) {
        return { success: true, data }
      }

      return { success: false }
    } catch (exception) {
      return { success: false, error: exception as Error }
    }
  }

  async create(
    databaseId: string,
    item: CreateQueryLibraryItem,
  ): Promise<QueryLibraryItemResult> {
    try {
      const url = getUrl(databaseId, ApiEndpoints.QUERY_LIBRARY)
      const { data, status } = await apiService.post<QueryLibraryItem>(
        url,
        item,
      )

      if (isStatusSuccessful(status)) {
        return { success: true, data }
      }

      return { success: false }
    } catch (exception) {
      return { success: false, error: exception as Error }
    }
  }

  async update(
    databaseId: string,
    id: string,
    item: UpdateQueryLibraryItem,
  ): Promise<QueryLibraryItemResult> {
    try {
      const url = getUrl(databaseId, ApiEndpoints.QUERY_LIBRARY, id)
      const { data, status } = await apiService.patch<QueryLibraryItem>(
        url,
        item,
      )

      if (isStatusSuccessful(status)) {
        return { success: true, data }
      }

      return { success: false }
    } catch (exception) {
      return { success: false, error: exception as Error }
    }
  }

  async delete(databaseId: string, id: string): Promise<QueryLibraryResult> {
    try {
      const url = getUrl(databaseId, ApiEndpoints.QUERY_LIBRARY, id)
      const { status } = await apiService.delete(url)

      if (isStatusSuccessful(status)) {
        return { success: true }
      }

      return { success: false }
    } catch (exception) {
      return { success: false, error: exception as Error }
    }
  }

  // No-op: for SQLite, query library cleanup is handled automatically by the backend
  // when an index is deleted (see redisearch.service.ts → deleteIndex).
  async deleteByIndex(
    _databaseId: string,
    _indexName: string,
  ): Promise<QueryLibraryResult> {
    return { success: true }
  }

  async seed(
    databaseId: string,
    items: SeedQueryLibraryItem[],
  ): Promise<QueryLibraryResult> {
    try {
      const url = getUrl(databaseId, ApiEndpoints.QUERY_LIBRARY_SEED)
      const { data, status } = await apiService.post<QueryLibraryItem[]>(url, {
        items,
      })

      if (isStatusSuccessful(status)) {
        return { success: true, data }
      }

      return { success: false }
    } catch (exception) {
      return { success: false, error: exception as Error }
    }
  }
}
