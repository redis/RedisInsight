import { flatten } from 'lodash'
import { CommandExecution, CommandExecutionType } from 'uiSrc/slices/interfaces'
import { BrowserStorageItem } from 'uiSrc/constants'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { getConfig } from 'uiSrc/config'
import { formatBytes } from 'uiSrc/utils'
import { WORKBENCH_HISTORY_MAX_LENGTH } from 'uiSrc/pages/workbench/constants'

const riConfig = getConfig()

export class WorkbenchStorage {
  private db?: IDBDatabase

  constructor(
    private readonly dbName: string,
    private readonly version = 1,
  ) {}

  private initDb(storeName: string) {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('indexedDB is not supported'))
        return
      }
      // Let us open our database
      const DBOpenRequest = window.indexedDB.open(this.dbName, this.version)

      DBOpenRequest.onerror = (event) => {
        event.preventDefault()
        reject(DBOpenRequest.error)
        console.error('indexedDB open error')
      }

      DBOpenRequest.onsuccess = () => {
        this.db = DBOpenRequest.result
        this.db.onversionchange = (e) => {
          // Triggered when the database is modified (e.g. adding an objectStore) or
          // deleted (even when initiated by other sessions in different tabs).
          // Closing the connection here prevents those operations from being blocked.
          // If the database is accessed again later by this instance, the connection
          // will be reopened or the database recreated as needed.
          ;(e.target as IDBDatabase)?.close()
        }
        resolve(this.db)
      }

      // This event handles the event whereby a new version of the database needs to be created
      // Either one has not been created before, or a new version number has been submitted via the
      // window.indexedDB.open line above
      // it is only implemented in recent browsers
      DBOpenRequest.onupgradeneeded = (event) => {
        this.db = DBOpenRequest.result

        this.db.onerror = (event) => {
          event.preventDefault()
          reject(DBOpenRequest.error)
        }

        try {
          if (
            event.newVersion &&
            event.newVersion > event.oldVersion &&
            event.oldVersion > 0 &&
            this.db.objectStoreNames.contains(storeName)
          ) {
            // if there is need to update
            this.db.deleteObjectStore(storeName)
          }
          // Create an objectStore for this database
          const objectStore = this.db.createObjectStore(storeName, {
            keyPath: ['id', 'databaseId'],
          })
          objectStore.createIndex('dbId', 'databaseId', { unique: false })
          objectStore.createIndex('commandId', 'id', { unique: true })
        } catch (ex) {
          if (ex instanceof DOMException && ex?.name === 'ConstraintError') {
            console.warn(
              `The database "${this.dbName}" has been upgraded from version ${event.oldVersion} to version 
              ${event.newVersion}, but the storage "${storeName}" already exists.`,
            )
          } else {
            throw ex
          }
        }
      }
    })
  }

  async getDb(storeName: string) {
    if (!this.db) {
      await this.initDb(storeName)
    }
    return this.db
  }

  getItem(
    storeName: string,
    commandId: string,
    onSuccess?: () => void,
    onError?: () => void,
  ) {
    return new Promise((resolve, reject) => {
      try {
        this.getDb(storeName).then((db) => {
          if (db === undefined) {
            reject(new Error('Failed to retrieve item from IndexedDB'))
            return
          }
          const objectStore = db
            .transaction(storeName, 'readonly')
            ?.objectStore(storeName)
          const idbIndex = objectStore?.index('commandId')
          const indexReq = idbIndex?.get(commandId)
          indexReq.onsuccess = () => {
            const value = indexReq.result
            onSuccess?.()
            resolve(value)
          }
          indexReq.onerror = () => {
            onError?.()
            reject(indexReq.error)
          }
        })
      } catch (e) {
        onError?.()
        reject(e)
      }
    })
  }

  getItems(
    storeName: string,
    dbId: string,
    onSuccess?: () => void,
    onError?: () => void,
  ) {
    return new Promise((resolve, reject) => {
      try {
        this.getDb(storeName).then((db) => {
          if (db === undefined) {
            reject(new Error('Failed to retrieve item from IndexedDB'))
            return
          }
          const objectStore = db
            .transaction(storeName, 'readonly')
            ?.objectStore(storeName)
          const idbIndex = objectStore?.index('dbId')
          const indexReq = idbIndex?.getAll(dbId)
          indexReq.onsuccess = () => {
            const values = indexReq.result
            onSuccess?.()
            if (values && values.length > 0) {
              resolve(values)
            } else {
              resolve([])
            }
          }
          indexReq.onerror = () => {
            onError?.()
            reject(indexReq.error)
          }
        })
      } catch (e) {
        onError?.()
        reject(e)
      }
    })
  }

  setItem(
    storeName: string,
    value: any,
    onSuccess?: () => void,
    onError?: () => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.getDb(storeName).then((db) => {
          if (db === undefined) {
            reject(new Error('Failed to set item in IndexedDB'))
            return
          }
          const transaction = db.transaction(storeName, 'readwrite')
          const req = transaction?.objectStore(storeName)?.put(value)
          transaction.oncomplete = () => {
            onSuccess?.()
            resolve()
          }
          transaction.onerror = () => {
            onError?.()
            reject(req?.error)
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  removeItem(
    storeName: string,
    dbId: string,
    commandId: string,
    onSuccess?: () => void,
    onError?: () => void,
  ): Promise<string | void> {
    return new Promise((resolve, reject) => {
      try {
        this.getDb(storeName).then((db) => {
          if (db === undefined) {
            reject(new Error('Failed to remove item from IndexedDB'))
            return
          }
          const transaction = db.transaction(storeName, 'readwrite')
          const req = transaction
            .objectStore(storeName)
            ?.delete([commandId, dbId])

          transaction.oncomplete = () => {
            onSuccess?.()
            resolve(commandId)
          }

          transaction.onerror = () => {
            onError?.()
            reject(req?.error)
          }
        })
      } catch (e) {
        onError?.()
        reject(e)
      }
    })
  }

  clear(
    storeName: string,
    dbId: string,
    onSuccess?: () => void,
    onError?: () => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.getDb(storeName).then((db) => {
          if (db === undefined) {
            reject(new Error('Failed to clear items in IndexedDB'))
            return
          }

          const objectStore = db
            .transaction(storeName, 'readwrite')
            ?.objectStore(storeName)
          const idbIndex = objectStore?.index('dbId')
          const indexReq = idbIndex?.openCursor(dbId)
          indexReq.onsuccess = () => {
            const cursor = indexReq.result
            onSuccess?.()
            if (cursor) {
              cursor.delete()
              cursor.continue()
            } else {
              // either deleted all items or there were none
              resolve()
            }
          }
          indexReq.onerror = () => {
            onError?.()
            reject(indexReq.error)
          }
        })
      } catch (e) {
        onError?.()
        reject(e)
      }
    })
  }
}

export const wbHistoryStorage = new WorkbenchStorage(
  riConfig.app.indexedDbName,
  2,
)

type CommandHistoryType = CommandExecution[]

export async function getLocalWbHistory(
  dbId: string,
  commandExecutionType?: CommandExecutionType,
) {
  try {
    const history =
      ((await wbHistoryStorage.getItems(
        BrowserStorageItem.wbCommandsHistory,
        dbId,
      )) as CommandHistoryType) || []

    if (!commandExecutionType) {
      return history
    }

    return history.filter((item) => item.type === commandExecutionType)
  } catch (e) {
    console.error(e)
    return []
  }
}

export function saveLocalWbHistory(commandsHistory: CommandHistoryType) {
  try {
    const key = BrowserStorageItem.wbCommandsHistory
    return Promise.all(
      flatten(
        commandsHistory.map((chItem) => wbHistoryStorage.setItem(key, chItem)),
      ),
    )
  } catch (e) {
    console.error(e)
    return null
  }
}

async function cleanupDatabaseHistory(dbId: string) {
  const commandsHistory: CommandHistoryType = await getLocalWbHistory(dbId)
  let size = 0
  // collect items up to maxItemsPerDb
  const update = commandsHistory
    .reverse()
    .reduce((acc, commandsHistoryElement) => {
      if (size >= WORKBENCH_HISTORY_MAX_LENGTH) {
        return acc
      }
      size++
      acc.push(commandsHistoryElement)
      return acc
    }, [] as CommandHistoryType)
  // clear old items
  await clearCommands(dbId)
  // save
  await saveLocalWbHistory(update)
}

export async function addCommands(data: CommandExecution[]) {
  // Store command results in local storage!
  const storedData = data.map((item) => {
    // Do not store command execution result that exceeded limitation
    if (JSON.stringify(item.result).length > riConfig.workbench.maxResultSize) {
      item.result = [
        {
          status: CommandExecutionStatus.Success,
          response: `Results have been deleted since they exceed ${formatBytes(riConfig.workbench.maxResultSize)}. 
          Re-run the command to see new results.`,
        },
      ]
    }
    return item
  })
  await saveLocalWbHistory(storedData)
  const [{ databaseId }] = storedData
  return cleanupDatabaseHistory(databaseId)
}

export async function removeCommand(dbId: string, commandId: string) {
  // Delete command from local storage?!
  await wbHistoryStorage.removeItem(
    BrowserStorageItem.wbCommandsHistory,
    dbId,
    commandId,
  )
}

export async function clearCommands(dbId: string) {
  await wbHistoryStorage.clear(BrowserStorageItem.wbCommandsHistory, dbId)
}

export async function findCommand(commandId: string) {
  // Fetch command from local storage
  return wbHistoryStorage.getItem(
    BrowserStorageItem.wbCommandsHistory,
    commandId,
  )
}
