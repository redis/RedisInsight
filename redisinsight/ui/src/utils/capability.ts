import { OAuthSocialSource, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { store } from 'uiSrc/slices/store'
import { Nullable } from 'uiSrc/utils'
import { findMarkdownPath } from 'uiSrc/utils/workbench'

const getCapability = (
  telemetryName: string = '',
  name: string = '',
  path: Nullable<string> = null,
) => ({
  telemetryName,
  name,
  path,
})

export const getSourceTutorialByCapability = (moduleName = '') =>
  `${moduleName}_tutorial`

export const getTutorialCapability = (source: any = '') => {
  switch (source) {
    // RediSearch
    case OAuthSocialSource.RediSearch:
    case OAuthSocialSource.BrowserSearch:
    case getSourceTutorialByCapability(RedisDefaultModules.SearchLight):
    case getSourceTutorialByCapability(RedisDefaultModules.Search):
    case getSourceTutorialByCapability(RedisDefaultModules.FT):
    case getSourceTutorialByCapability(RedisDefaultModules.FTL):
      return getCapability(
        'searchAndQuery',
        'Redis Query Engine',
        findMarkdownPath(store.getState()?.workbench?.tutorials?.items, {
          id: 'sq-intro',
        }),
      )

    // RedisJSON
    case OAuthSocialSource.RedisJSON:
    case getSourceTutorialByCapability(RedisDefaultModules.ReJSON):
      return getCapability(
        'JSON',
        'JSON data structure',
        findMarkdownPath(store.getState()?.workbench?.tutorials?.items, {
          id: 'ds-json-intro',
        }),
      )

    // TimeSeries
    case OAuthSocialSource.RedisTimeSeries:
    case getSourceTutorialByCapability(RedisDefaultModules.TimeSeries):
      return getCapability(
        'timeSeries',
        'Time series data structure',
        findMarkdownPath(store.getState()?.workbench?.tutorials?.items, {
          id: 'ds-ts-intro',
        }),
      )

    // Bloom
    case OAuthSocialSource.RedisBloom:
    case getSourceTutorialByCapability(RedisDefaultModules.Bloom):
      return getCapability(
        'probabilistic',
        'Probabilistic data structures',
        findMarkdownPath(store.getState()?.workbench?.tutorials?.items, {
          id: 'ds-prob-intro',
        }),
      )

    default:
      return getCapability()
  }
}
