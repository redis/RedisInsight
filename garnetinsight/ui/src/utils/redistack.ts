import { isArray, map, concat, remove, find } from 'lodash'
import { Instance, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { isVersionHigherOrEquals, Nullable } from 'uiSrc/utils'

const REDISTACK_VERSION = '6.2.5'
const NON_REDISTACK_VERSION = '7.9'

const REDISTACK_REQUIRE_MODULES: Array<string | Array<string>> = [
  RedisDefaultModules.ReJSON,
  RedisDefaultModules.Bloom,
  [RedisDefaultModules.Search, RedisDefaultModules.SearchLight],
  RedisDefaultModules.TimeSeries,
]

const REDISTACK_OPTIONAL_MODULES: Array<string | Array<string>> = [
  RedisDefaultModules.Graph,
  [RedisDefaultModules.RedisGears, RedisDefaultModules.RedisGears2],
]

const MIN_MODULES_LENGTH = REDISTACK_REQUIRE_MODULES.length
const MAX_MODULES_LENGTH =
  REDISTACK_REQUIRE_MODULES.length + REDISTACK_OPTIONAL_MODULES.length

const checkRediStackModules = (modules: any[]) => {
  if (!modules?.length) return false
  const moduleNames = map(modules, 'name').sort()

  if (modules.length === MIN_MODULES_LENGTH) {
    return moduleNames.every((m, index) =>
      isArray(REDISTACK_REQUIRE_MODULES[index])
        ? (REDISTACK_REQUIRE_MODULES[index] as Array<string>).some(
            (rm) => rm === m,
          )
        : REDISTACK_REQUIRE_MODULES[index] === m,
    )
  }

  if (
    modules.length > MIN_MODULES_LENGTH &&
    modules.length <= MAX_MODULES_LENGTH
  ) {
    let isCustomModule = false
    const rediStackModules = concat(
      REDISTACK_REQUIRE_MODULES,
      REDISTACK_OPTIONAL_MODULES,
    ).sort()

    const diff = rediStackModules.reduce(
      (acc: Array<string>, current: string | Array<string>) => {
        const moduleName = isArray(current)
          ? (current as Array<string>).find((item) =>
              find(moduleNames, (m) => item === m),
            )
          : find(moduleNames, (name) => name === current)

        if (moduleName) {
          remove(acc, (name) => moduleName === name)

          return acc
        }
        isCustomModule = true

        return acc
      },
      moduleNames,
    )

    return isCustomModule && !diff.length
  }

  return false
}

const isRediStack = (modules: any[], version?: Nullable<string>): boolean => {
  if (!version) {
    return checkRediStackModules(modules)
  }

  if (isVersionHigherOrEquals(version, NON_REDISTACK_VERSION)) {
    return false
  }

  if (isVersionHigherOrEquals(version, REDISTACK_VERSION)) {
    return checkRediStackModules(modules)
  }

  return false
}

const checkRediStack = (instances: Instance[]): Instance[] =>
  instances.map((instance) => ({
    ...instance,
    isRediStack: isRediStack(instance.modules, instance.version),
  }))

export { checkRediStack, isRediStack }
