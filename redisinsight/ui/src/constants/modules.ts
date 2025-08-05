import {
  DATABASE_LIST_MODULES_TEXT,
  RedisDefaultModules,
} from 'uiSrc/slices/interfaces'
import { AllIconsType } from 'uiSrc/components/base/icons'

// Define the type for each module info entry
export interface ModuleInfo {
  iconDark: AllIconsType
  iconLight: AllIconsType
  text: string
}

// Define the type for the entire modules info object
export type ModulesInfoType = {
  [Key in RedisDefaultModules]: ModuleInfo
}

const rediSearchIcons: {
  iconDark: AllIconsType
  iconLight: AllIconsType
} = {
  iconDark: 'RedisSearchDarkIcon',
  iconLight: 'RedisSearchLightIcon',
}

export const DEFAULT_MODULES_INFO: ModulesInfoType = {
  [RedisDefaultModules.AI]: {
    iconDark: 'RedisAIDarkIcon',
    iconLight: 'RedisAILightIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.AI],
  },
  [RedisDefaultModules.Bloom]: {
    iconDark: 'RedisBloomDarkIcon',
    iconLight: 'RedisBloomLightIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Bloom],
  },
  [RedisDefaultModules.Gears]: {
    iconDark: 'RedisGearsDarkIcon',
    iconLight: 'RedisGearsLightIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Gears],
  },
  [RedisDefaultModules.Graph]: {
    iconDark: 'RedisGraphDarkIcon',
    iconLight: 'RedisGraphLightIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Graph],
  },
  [RedisDefaultModules.RedisGears]: {
    iconDark: 'RedisGearsDarkIcon',
    iconLight: 'RedisGearsLightIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.RedisGears],
  },
  [RedisDefaultModules.RedisGears2]: {
    iconDark: 'RedisGears2DarkIcon',
    iconLight: 'RedisGears2LightIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.RedisGears2],
  },
  [RedisDefaultModules.ReJSON]: {
    iconDark: 'RedisJSONDarkIcon',
    iconLight: 'RedisJSONLightIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.ReJSON],
  },
  [RedisDefaultModules.Search]: {
    ...rediSearchIcons,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Search],
  },
  [RedisDefaultModules.SearchLight]: {
    ...rediSearchIcons,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.SearchLight],
  },
  [RedisDefaultModules.FT]: {
    ...rediSearchIcons,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.FT],
  },
  [RedisDefaultModules.FTL]: {
    ...rediSearchIcons,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.FTL],
  },
  [RedisDefaultModules.TimeSeries]: {
    iconDark: 'RedisTimeSeriesDarkIcon',
    iconLight: 'RedisTimeSeriesLightIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.TimeSeries],
  },
}
