import { app } from 'electron'
import path from 'path'

export const getAssetPath = (...paths: string[]): string => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../../resources')

  return path.join(RESOURCES_PATH, ...paths)
}
