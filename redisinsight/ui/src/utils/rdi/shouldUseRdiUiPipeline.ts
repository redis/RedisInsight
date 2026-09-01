import { getConfig } from 'uiSrc/config'
import { isVersionHigherOrEquals } from 'uiSrc/utils'

const riConfig = getConfig()

export const shouldUseRdiUiPipeline = (
  version: string,
  isDevRdiUiEnabled: boolean,
): boolean =>
  isDevRdiUiEnabled &&
  isVersionHigherOrEquals(version, riConfig.features.rdiUi.minSupportedVersion)
