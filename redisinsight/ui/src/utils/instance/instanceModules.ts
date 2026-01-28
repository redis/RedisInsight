import { find, isNumber } from 'lodash'
import modulesInit from 'uiSrc/constants/allRedisModules.json'
import {
  DATABASE_LIST_MODULES_TEXT,
  Instance,
  AdditionalRedisModule,
} from 'uiSrc/slices/interfaces'

const getGenericModuleName = (name = '') =>
  (DATABASE_LIST_MODULES_TEXT[name] ?? name)
    ?.toLowerCase?.()
    .replaceAll?.(/[-_]/gi, '')

export const getModule = (propName = ''): any =>
  find(
    modulesInit,
    ({ name }) => getGenericModuleName(name) === getGenericModuleName(propName),
  ) ?? {}

const convertToSemanticVersion = (input?: number): string => {
  if (input === undefined || input === null) {
    return ''
  }
  const separator = '.'
  try {
    if (isNumber(input) && input > 0) {
      // Pad input with optional zero symbols
      const version = String(input).padStart(6, '0')
      const patch = parseInt(version.slice(-2), 10)
      const minor = parseInt(version.slice(-4, -2), 10)
      const major = parseInt(version.slice(0, -4), 10)
      return [major, minor, patch].join(separator)
    }
  } catch (e) {
    console.error('Failed to generate semantic version.', e)
  }
  return `${input}`
}

const ensureModuleSemanticVersion = (
  module: AdditionalRedisModule,
): AdditionalRedisModule => ({
  ...module,
  semanticVersion:
    module.semanticVersion || convertToSemanticVersion(module.version),
})

export const ensureSemanticVersion = (instance: Instance): Instance => {
  if (!instance.modules || !Array.isArray(instance.modules)) {
    return instance
  }
  return {
    ...instance,
    modules: instance.modules?.map(ensureModuleSemanticVersion),
  }
}
