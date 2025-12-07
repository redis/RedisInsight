import { OAuthSocialSource, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import {
  getSourceTutorialByCapability,
  getTutorialCapability,
} from '../capability'

const getSourceTutorialByCapabilityTests: any[] = [
  ['123', '123_tutorial'],
  ['ueouoeu', 'ueouoeu_tutorial'],
  ['2.puipy4', '2.puipy4_tutorial'],
]

describe('getSourceTutorialByCapability', () => {
  it.each(getSourceTutorialByCapabilityTests)(
    'for input: %s (input), should be output: %s',
    (input, expected) => {
      const result = getSourceTutorialByCapability(input)
      expect(result).toBe(expected)
    },
  )
})

const emptyCapability = { name: '', telemetryName: '', path: null }
const searchCapability = {
  name: 'Redis Query Engine',
  telemetryName: 'searchAndQuery',
  path: null,
}
const jsonCapability = {
  name: 'JSON data structure',
  telemetryName: 'JSON',
  path: null,
}
const tsCapability = {
  name: 'Time series data structure',
  telemetryName: 'timeSeries',
  path: null,
}
const bloomCapability = {
  name: 'Probabilistic data structures',
  telemetryName: 'probabilistic',
  path: null,
}

const getTutorialCapabilityTests: any[] = [
  [OAuthSocialSource.RediSearch, searchCapability],
  [OAuthSocialSource.BrowserSearch, searchCapability],
  [
    getSourceTutorialByCapability(RedisDefaultModules.SearchLight),
    searchCapability,
  ],
  [getSourceTutorialByCapability(RedisDefaultModules.Search), searchCapability],
  [getSourceTutorialByCapability(RedisDefaultModules.FT), searchCapability],
  [getSourceTutorialByCapability(RedisDefaultModules.FTL), searchCapability],

  [OAuthSocialSource.RedisJSON, jsonCapability],
  [getSourceTutorialByCapability(RedisDefaultModules.ReJSON), jsonCapability],

  [OAuthSocialSource.RedisTimeSeries, tsCapability],
  [getSourceTutorialByCapability(RedisDefaultModules.TimeSeries), tsCapability],

  [OAuthSocialSource.RedisBloom, bloomCapability],
  [getSourceTutorialByCapability(RedisDefaultModules.Bloom), bloomCapability],

  // empty capabilities
  [OAuthSocialSource.Autodiscovery, emptyCapability],
  [OAuthSocialSource.ListOfDatabases, emptyCapability],
  [getSourceTutorialByCapability(RedisDefaultModules.Graph), emptyCapability],
  [getSourceTutorialByCapability(RedisDefaultModules.AI), emptyCapability],
]

describe('getTutorialCapability', () => {
  it.each(getTutorialCapabilityTests)(
    'for input: %s (source), should be output: %s',
    (source, expected) => {
      const result = getTutorialCapability(source)

      expect(result).toEqual(expected)
    },
  )
})
