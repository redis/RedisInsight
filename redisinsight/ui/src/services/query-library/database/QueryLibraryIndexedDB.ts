import { v4 as uuidv4 } from 'uuid'
import {
  QueryLibraryItem,
  QueryLibraryType,
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
import { queryLibraryStorage } from './QueryLibraryStorage'

export class QueryLibraryIndexedDB implements QueryLibraryDatabase {
  async getList(
    databaseId: string,
    filter: QueryLibraryFilter,
  ): Promise<QueryLibraryResult> {
    try {
      const raw = await queryLibraryStorage.getAllByIndex(
        databaseId,
        filter.indexName,
      )

      let items = raw || []

      if (filter.search) {
        const term = filter.search.toLowerCase()
        items = items.filter(
          (item) =>
            item.name?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term) ||
            item.query?.toLowerCase().includes(term),
        )
      }

      items.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )

      return { success: true, data: items }
    } catch (exception) {
      return { success: false, error: exception as Error }
    }
  }

  async getOne(
    databaseId: string,
    id: string,
  ): Promise<QueryLibraryItemResult> {
    try {
      const item = await queryLibraryStorage.getById(id)

      if (!item || item.databaseId !== databaseId) {
        return { success: false }
      }

      return { success: true, data: item }
    } catch (exception) {
      return { success: false, error: exception as Error }
    }
  }

  async create(
    databaseId: string,
    data: CreateQueryLibraryItem,
  ): Promise<QueryLibraryItemResult> {
    try {
      const now = new Date().toISOString()
      const item: QueryLibraryItem = {
        id: uuidv4(),
        databaseId,
        indexName: data.indexName,
        type: QueryLibraryType.Saved,
        name: data.name,
        query: data.query,
        createdAt: now,
        updatedAt: now,
      }

      await queryLibraryStorage.put(item)

      return { success: true, data: item }
    } catch (exception) {
      return { success: false, error: exception as Error }
    }
  }

  async update(
    databaseId: string,
    id: string,
    data: UpdateQueryLibraryItem,
  ): Promise<QueryLibraryItemResult> {
    try {
      const getResult = await this.getOne(databaseId, id)

      if (!getResult.success || !getResult.data) {
        return { success: false, error: getResult.error }
      }

      const updated: QueryLibraryItem = {
        ...getResult.data,
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.query !== undefined && { query: data.query }),
        updatedAt: new Date().toISOString(),
      }

      await queryLibraryStorage.put(updated)

      return { success: true, data: updated }
    } catch (exception) {
      return { success: false, error: exception as Error }
    }
  }

  async delete(databaseId: string, id: string): Promise<QueryLibraryResult> {
    try {
      const getResult = await this.getOne(databaseId, id)

      if (!getResult.success || !getResult.data) {
        return { success: false, error: getResult.error }
      }

      await queryLibraryStorage.remove(id)
      return { success: true }
    } catch (exception) {
      return { success: false, error: exception as Error }
    }
  }

  async seed(
    databaseId: string,
    items: SeedQueryLibraryItem[],
  ): Promise<QueryLibraryResult> {
    try {
      if (!items.length) {
        return { success: true, data: [] }
      }

      const indexName = items[0].indexName
      const listResult = await this.getList(databaseId, { indexName })

      if (!listResult.success) {
        return { success: false, error: listResult.error }
      }

      const existing = listResult.data || []

      const existingSampleNames = new Set(
        existing
          .filter((item) => item.type === QueryLibraryType.Sample)
          .map((item) => item.name),
      )

      const newItems = items.filter(
        (item) => !existingSampleNames.has(item.name),
      )

      const now = new Date().toISOString()
      const created: QueryLibraryItem[] = []

      for (const seedItem of newItems) {
        const item: QueryLibraryItem = {
          id: uuidv4(),
          databaseId,
          indexName: seedItem.indexName,
          type: QueryLibraryType.Sample,
          name: seedItem.name,
          description: seedItem.description,
          query: seedItem.query,
          createdAt: now,
          updatedAt: now,
        }

        await queryLibraryStorage.put(item)
        created.push(item)
      }

      return { success: true, data: [...existing, ...created] }
    } catch (exception) {
      return { success: false, error: exception as Error }
    }
  }
}
