import { getConfig } from 'uiSrc/config'
import { BrowserStorageItem } from 'uiSrc/constants'
import { QueryLibraryItem } from '../types'

const riConfig = getConfig()
const DB_NAME = riConfig.app.queryLibraryIndexedDbName
const STORE_NAME = BrowserStorageItem.queryLibrary

export class QueryLibraryStorage {
  private db?: IDBDatabase

  private initPromise?: Promise<IDBDatabase>

  private initDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('indexedDB is not supported'))
        return
      }

      const request = window.indexedDB.open(DB_NAME, 1)

      request.onerror = (event) => {
        event.preventDefault()
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        this.db.onversionchange = (e) => {
          ;(e.target as IDBDatabase)?.close()
          this.db = undefined
          this.initPromise = undefined
        }
        resolve(this.db)
      }

      request.onupgradeneeded = () => {
        const db = request.result

        db.onerror = (event) => {
          event.preventDefault()
          reject(request.error)
        }

        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('databaseId_indexName', ['databaseId', 'indexName'], {
          unique: false,
        })
      }
    })
  }

  private async getDb(): Promise<IDBDatabase> {
    if (!this.db) {
      this.initPromise ??= this.initDb().catch((err) => {
        this.initPromise = undefined
        throw err
      })
      await this.initPromise
    }
    return this.db!
  }

  async getAllByIndex(
    databaseId: string,
    indexName: string,
  ): Promise<QueryLibraryItem[]> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const index = tx.objectStore(STORE_NAME).index('databaseId_indexName')
      const req = index.getAll([databaseId, indexName])

      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => reject(req.error)
    })
  }

  async getById(id: string): Promise<QueryLibraryItem | undefined> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(id)

      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  async put(item: QueryLibraryItem): Promise<void> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(item)

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async remove(id: string): Promise<void> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(id)

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
}

export const queryLibraryStorage = new QueryLibraryStorage()
