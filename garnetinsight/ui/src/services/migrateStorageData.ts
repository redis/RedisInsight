import { isString } from 'lodash'
import { BrowserStorageItem } from 'uiSrc/constants'
import {
  getDBConfigStorageField,
  localStorageService,
  setDBConfigStorageField,
} from './storage'

export const migrateLocalStorageData = () => {
  migrateDelimiterTreeView()
}

const migrateDelimiterTreeView = () => {
  const prefix = 'dbConfig_'
  const storage = localStorageService.getAll()

  // Iterate over all keys and filter for the dbConfig_ prefix
  Object.keys(storage).forEach((key) => {
    if (key.startsWith(prefix)) {
      const instanceId = key.replace(prefix, '')

      const treeViewDelimiter = getDBConfigStorageField(
        instanceId,
        BrowserStorageItem.treeViewDelimiter,
      )

      // Check if treeViewDelimiter is a string and needs transform to array
      if (isString(treeViewDelimiter)) {
        setDBConfigStorageField(
          instanceId,
          BrowserStorageItem.treeViewDelimiter,
          [{ label: treeViewDelimiter }],
        )
      }
    }
  })
}
