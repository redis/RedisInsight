import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  connectedInstanceInfoSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { REDISEARCH_MODULES } from 'uiSrc/slices/interfaces'
import { isRedisVersionSupported } from 'uiSrc/utils/comparisons/compareVersions'

import { UseRedisInstanceCompatibilityReturn } from './useRedisInstanceCompatibility.types'

const MIN_REDISEARCH_VERSION = '2.0.0'
const MIN_SUPPORTED_REDIS_VERSION = '7.2.0'
const REDISEARCH_MODULE_SET = new Set(REDISEARCH_MODULES)

/**
 * Redis modules encode versions as integers in MMmmpp format:
 * major * 10000 + minor * 100 + patch (e.g. 10614 → 1.6.14, 20600 → 2.6.0).
 */
const decodeModuleVersion = (version: number): string => {
  const major = Math.floor(version / 10000)
  const minor = Math.floor((version % 10000) / 100)
  const patch = version % 100
  return `${major}.${minor}.${patch}`
}

export const useRedisInstanceCompatibility =
  (): UseRedisInstanceCompatibilityReturn => {
    const { version } = useSelector(connectedInstanceInfoSelector)

    const { loading, modules = [] } = useSelector(connectedInstanceSelector)

    const isInitialized = loading !== undefined

    const redisearchModule = useMemo(
      () => modules?.find((m) => REDISEARCH_MODULE_SET.has(m.name)),
      [modules],
    )

    const redisearchPresent = isInitialized
      ? modules
        ? !!redisearchModule
        : undefined
      : undefined

    const redisearchVersion =
      redisearchModule?.semanticVersion ??
      (redisearchModule?.version != null
        ? decodeModuleVersion(redisearchModule.version)
        : undefined)
    const hasMinRedisearch =
      isInitialized && redisearchVersion
        ? isRedisVersionSupported(redisearchVersion, MIN_REDISEARCH_VERSION)
        : undefined

    const hasVersion = isInitialized && version

    return {
      loading,
      hasRedisearch: redisearchPresent,
      hasMinimumRedisearchVersion: hasMinRedisearch,
      hasSupportedVersion: hasVersion
        ? isRedisVersionSupported(version, MIN_SUPPORTED_REDIS_VERSION)
        : undefined,
    }
  }
