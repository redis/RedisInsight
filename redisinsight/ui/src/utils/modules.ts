import { find, some } from 'lodash'

import { getModule, truncateText } from 'uiSrc/utils'
import {
  DATABASE_LIST_MODULES_TEXT,
  Instance,
  RedisDefaultModules,
  REDISEARCH_MODULES,
} from 'uiSrc/slices/interfaces'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import { DEFAULT_MODULES_INFO, ModuleInfo } from 'uiSrc/constants/modules'
import { AllIconsType } from 'uiSrc/components/base/icons'

export interface IDatabaseModule {
  abbreviation: string
  moduleName: string
  icon?: any
  content?: any
  [key: string]: any
}

const PREDEFINED_MODULE_NAMES_ORDER: (keyof typeof DATABASE_LIST_MODULES_TEXT)[] =
  [
    RedisDefaultModules.Search,
    RedisDefaultModules.SearchLight,
    RedisDefaultModules.ReJSON,
    RedisDefaultModules.Graph,
    RedisDefaultModules.TimeSeries,
    RedisDefaultModules.Bloom,
    RedisDefaultModules.Gears,
    RedisDefaultModules.AI,
    RedisDefaultModules.VectorSet,
  ]

const PREDEFINED_MODULES_ORDER = PREDEFINED_MODULE_NAMES_ORDER.map(
  (module) => DATABASE_LIST_MODULES_TEXT[module],
) as readonly string[]

const getModuleOrder = (name: string) =>
  (PREDEFINED_MODULES_ORDER as readonly string[]).indexOf(name)

export const sortModules = (modules: IDatabaseModule[] = []) =>
  modules.sort((a, b) => {
    if (!a.moduleName && !a.abbreviation) return 1
    if (!b.moduleName && !b.abbreviation) return -1
    if (getModuleOrder(a.moduleName) === -1) return 1
    if (getModuleOrder(b.moduleName) === -1) return -1
    return getModuleOrder(a.moduleName) - getModuleOrder(b.moduleName)
  })

export const sortModulesByName = (modules: AdditionalRedisModule[] = []) =>
  [...modules].sort((a, b) => {
    const aIndex = getModuleOrder(a.name)
    const bIndex = getModuleOrder(b.name)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

export const isRedisearchModule = (moduleName: string) =>
  REDISEARCH_MODULES.some((value) => moduleName === value)
export const isRedisearchAvailable = (
  modules: AdditionalRedisModule[],
): boolean => modules?.some(({ name }) => isRedisearchModule(name))

export const isContainJSONModule = (
  modules: AdditionalRedisModule[],
): boolean =>
  modules?.some(
    (m: AdditionalRedisModule) => m.name === RedisDefaultModules.ReJSON,
  )

export const getDbWithModuleLoaded = (
  databases: Instance[],
  moduleName: string,
) =>
  find(databases, ({ modules }) => {
    if (isRedisearchModule(moduleName)) return isRedisearchAvailable(modules)

    return some(modules, ({ name }) => name === moduleName)
  })

export const transformModule = (
  additionalModule: AdditionalRedisModule,
): IDatabaseModule => {
  const {
    name: propName,
    semanticVersion = '',
    version = '',
  } = additionalModule

  const isValidModuleKey = Object.values(RedisDefaultModules).includes(
    propName as RedisDefaultModules,
  )

  const module: ModuleInfo | undefined = isValidModuleKey
    ? DEFAULT_MODULES_INFO[propName as RedisDefaultModules]
    : undefined
  const moduleName = module?.text || propName

  const { abbreviation = '', name = moduleName } = getModule(moduleName)

  const moduleAlias = truncateText(name, 50)
  let icon: AllIconsType | undefined = module?.icon
  const versionText =
    semanticVersion || version ? ` v. ${semanticVersion || version}` : ''
  const content = `${moduleAlias}${versionText}`

  if (!icon && !abbreviation) {
    icon = 'UnknownModuleIcon'
  }

  return {
    moduleName,
    icon,
    abbreviation,
    content,
  }
}
