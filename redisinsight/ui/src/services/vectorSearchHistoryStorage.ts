import { getConfig } from 'uiSrc/config'
import { WorkbenchStorage } from './workbenchStorage'

const riConfig = getConfig()

export const vectorSearchCommandsHistoryStorage = new WorkbenchStorage(
  riConfig.app.vectorSearchIndexedDbName,
  1,
)
