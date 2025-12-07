import { isObjectLike } from 'lodash'
import { Maybe } from 'uiSrc/utils'
import { updateDbSettings } from 'uiSrc/services/databaseSettingsService'
import BrowserStorageItem from '../constants/storage'

class StorageService {
  private storage: Storage

  private envKey: Maybe<string>

  constructor(storage: Storage, envKey?: string) {
    this.storage = storage
    this.envKey = envKey
  }

  private getKey(itemName: string): string {
    return this.envKey ? `${this.envKey}_${itemName}` : itemName
  }

  get(itemName: string = '') {
    const key = this.getKey(itemName)
    let item
    try {
      item = this.storage.getItem(key)
    } catch (error) {
      console.error(`getItem from storage error: ${error}`)
    }

    if (item) {
      try {
        return JSON.parse(item)
      } catch (e) {
        return item
      }
    }
    return null
  }

  set(itemName: string = '', item: any) {
    try {
      const key = this.getKey(itemName)
      if (isObjectLike(item)) {
        this.storage.setItem(key, JSON.stringify(item))
      } else {
        this.storage.setItem(key, item)
      }
    } catch (error) {
      console.error(`setItem to storage error: ${error}`)
    }
  }

  remove(itemName: string = '') {
    const key = this.getKey(itemName)
    this.storage.removeItem(key)
  }

  getAll() {
    return this.storage
  }
}
const envKey = window.__RI_PROXY_PATH__

export const localStorageService = new StorageService(localStorage, envKey)
export const sessionStorageService = new StorageService(sessionStorage, envKey)

export const getObjectStorageField = (itemName = '', field = '') => {
  try {
    return localStorageService?.get(itemName)?.[field]
  } catch (e) {
    return null
  }
}
export const getObjectStorage = (itemName = '') => {
  try {
    return localStorageService?.get(itemName)
  } catch (e) {
    return null
  }
}

export const setObjectStorageField = (
  itemName = '',
  field = '',
  value?: any,
) => {
  try {
    const config = localStorageService?.get(itemName) || {}

    if (value === undefined) {
      delete config[field]
      localStorageService?.set(itemName, config)
      return
    }

    localStorageService?.set(itemName, {
      ...config,
      [field]: value,
    })
  } catch (e) {
    console.error(e)
  }
}

export const setObjectStorage = (itemName = '', obj?: Record<string, any>) => {
  try {
    const config = localStorageService?.get(itemName) || {}

    if (obj === undefined) {
      localStorageService?.remove(itemName)
      return
    }

    localStorageService?.set(itemName, {
      ...config,
      ...obj,
    })
  } catch (e) {
    console.error(e)
  }
}

export const getDBConfigStorageField = (
  instanceId: string,
  field: string = '',
) => getObjectStorageField(BrowserStorageItem.dbConfig + instanceId, field)

export const setDBConfigStorageField = (
  instanceId: string,
  field: string = '',
  value?: any,
) => {
  const itemName = BrowserStorageItem.dbConfig + instanceId
  setObjectStorageField(itemName, field, value)
  // on each update of config value, update db settings via the API
  const config = getObjectStorage(itemName)
  if (config) {
    updateDbSettings(instanceId, config)
  }
}

export const getCapabilityStorageField = (field: string = '') =>
  getObjectStorageField(BrowserStorageItem.capability, field)

export const setCapabilityStorageField = (field: string = '', value?: any) => {
  setObjectStorageField(BrowserStorageItem.capability, field, value)
}

export default StorageService
