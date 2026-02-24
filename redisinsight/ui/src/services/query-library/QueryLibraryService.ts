import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { store } from 'uiSrc/slices/store'
import {
  addErrorNotification,
  IAddInstanceErrorPayload,
} from 'uiSrc/slices/app/notifications'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import {
  QueryLibraryItem,
  CreateQueryLibraryItem,
  UpdateQueryLibraryItem,
  SeedQueryLibraryItem,
  QueryLibraryFilter,
} from './types'
import { QueryLibraryDatabase } from './database/interface'
import { QueryLibrarySQLite } from './database/QueryLibrarySQLite'
import { QueryLibraryIndexedDB } from './database/QueryLibraryIndexedDB'

export class QueryLibraryService {
  private database: QueryLibraryDatabase

  constructor() {
    this.database = this.initializeDatabase()
  }

  private initializeDatabase(): QueryLibraryDatabase {
    const state = store.getState()
    const { [FeatureFlags.envDependent]: envDependentFeature } =
      appFeatureFlagsFeaturesSelector(state)

    if (envDependentFeature?.flag) {
      return new QueryLibrarySQLite()
    }

    return new QueryLibraryIndexedDB()
  }

  async getList(
    databaseId: string,
    filter: QueryLibraryFilter,
  ): Promise<QueryLibraryItem[]> {
    const { data, error } = await this.database.getList(databaseId, filter)

    if (error) {
      store.dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
    }

    return data || []
  }

  async getOne(
    databaseId: string,
    id: string,
  ): Promise<QueryLibraryItem | null> {
    const { data, error } = await this.database.getOne(databaseId, id)

    if (error) {
      store.dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
    }

    return data || null
  }

  async create(
    databaseId: string,
    item: CreateQueryLibraryItem,
  ): Promise<QueryLibraryItem | null> {
    const { data, error } = await this.database.create(databaseId, item)

    if (error) {
      store.dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
    }

    return data || null
  }

  async update(
    databaseId: string,
    id: string,
    item: UpdateQueryLibraryItem,
  ): Promise<QueryLibraryItem | null> {
    const { data, error } = await this.database.update(databaseId, id, item)

    if (error) {
      store.dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
    }

    return data || null
  }

  async delete(databaseId: string, id: string): Promise<void> {
    const { error } = await this.database.delete(databaseId, id)

    if (error) {
      store.dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      throw error
    }
  }

  async seed(
    databaseId: string,
    items: SeedQueryLibraryItem[],
  ): Promise<QueryLibraryItem[]> {
    const { data, error } = await this.database.seed(databaseId, items)

    if (error) {
      store.dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
    }

    return data || []
  }
}

export default QueryLibraryService
