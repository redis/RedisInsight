import {
  DATABASE_LIST_MODULES_TEXT,
  RedisDefaultModules,
} from 'uiSrc/slices/interfaces'
import { AllIconsType } from 'uiSrc/components/base/icons/RiIcon'

// Define the type for each module info entry
export interface ModuleInfo {
  icon: AllIconsType
  text: string
}

// Define the type for the entire modules info object
export type ModulesInfoType = {
  [Key in RedisDefaultModules]: ModuleInfo
}

const rediSearchIcons: Omit<ModuleInfo, 'text'> = {
  icon: 'QuerySearchIcon',
}

export const DEFAULT_MODULES_INFO: ModulesInfoType = {
  [RedisDefaultModules.AI]: {
    icon: 'RedisAiIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.AI],
  },
  [RedisDefaultModules.Bloom]: {
    icon: 'ProbabilisticIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Bloom],
  },
  [RedisDefaultModules.Gears]: {
    icon: 'RedisGearsIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Gears],
  },
  [RedisDefaultModules.Graph]: {
    icon: 'RedisGraphIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Graph],
  },
  [RedisDefaultModules.RedisGears]: {
    icon: 'RedisGearsIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.RedisGears],
  },
  [RedisDefaultModules.RedisGears2]: {
    icon: 'RedisGears2Icon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.RedisGears2],
  },
  [RedisDefaultModules.ReJSON]: {
    icon: 'JsonIcon',
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
    icon: 'TimeSeriesIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.TimeSeries],
  },
  [RedisDefaultModules.VectorSet]: {
    icon: 'VectorSetIcon',
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.VectorSet],
  },
}
