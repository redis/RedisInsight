import ElectronStore from 'electron-store'
import log from 'electron-log'

import { ElectronStorageItem } from 'uiSrc/electron/constants'

class ElectronStoreService {
  private storage: ElectronStore

  constructor() {
    this.storage = new ElectronStore()
  }

  get(itemName: ElectronStorageItem) {
    let item
    try {
      item = this.storage.get<ElectronStorageItem>(itemName)
    } catch (error) {
      log.error(`get from electron store error: ${error}`)
    }

    return item ?? null
  }

  getAllItems() {
    return this.storage.store
  }

  set(itemName: ElectronStorageItem, item: any) {
    try {
      this.storage.set<ElectronStorageItem>(itemName, item)
    } catch (error) {
      log.error(`set to electron store error: ${error}`)
    }
  }

  delete(itemName: ElectronStorageItem) {
    try {
      this.storage.delete<ElectronStorageItem>(itemName)
    } catch (error) {
      log.error(`delete from electron store error: ${error}`)
    }
  }
}

export const electronStore = new ElectronStoreService()
