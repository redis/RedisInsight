import { getOriginUrl } from 'uiSrc/services/resourcesService'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'

enum TutorialsPaths {
  CustomTutorials = 'custom-tutorials',
  Guide = 'guides',
  Tutorials = 'tutorials',
}

export const getRootStaticPath = (mdPath: string) => {
  const paths = mdPath?.split('/') || []
  const tutorialFolder = paths[1]

  if (tutorialFolder === TutorialsPaths.CustomTutorials)
    return paths.slice(0, 3).join('/')
  if (
    tutorialFolder === TutorialsPaths.Guide ||
    tutorialFolder === TutorialsPaths.Tutorials
  ) {
    return paths.slice(0, 2).join('/')
  }

  return mdPath
}

const processAbsolutePath = (nodeUrl: string, mdPath: string) => {
  const tutorialRootPath = getRootStaticPath(mdPath)
  return new URL(tutorialRootPath + nodeUrl, getOriginUrl()).toString()
}

export const getFileUrlFromMd = (nodeUrl: string, mdPath: string): string => {
  // process external link
  if (IS_ABSOLUTE_PATH.test(nodeUrl)) return nodeUrl

  if (nodeUrl.startsWith('/') || nodeUrl.startsWith('\\')) {
    return processAbsolutePath(nodeUrl, mdPath)
  }

  // process relative path
  const pathUrl = new URL(mdPath, getOriginUrl())
  return new URL(nodeUrl, pathUrl).toString()
}

export const getFileNameFromPath = (path: string): string =>
  path.split('/').pop() || ''

/**
 * Get the correct path for static assets based on the environment
 * In Electron, use relative paths; in web, use absolute paths
 */
export const getStaticAssetPath = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  // window.app is only available in Electron environment
  const isElectron =
    typeof window !== 'undefined' &&
    window.app !== undefined &&
    window.app !== null

  return isElectron ? `./${cleanPath}` : `/${cleanPath}`
}
