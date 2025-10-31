import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  connectedInstanceInfoSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { REDISEARCH_MODULES } from 'uiSrc/slices/interfaces'
import { isRedisVersionSupported } from 'uiSrc/utils/comparisons/compareVersions'

export type UseRedisInstanceCompatibilityReturn = {
  loading: boolean | undefined
  hasRedisearch: boolean | undefined
  hasSupportedVersion: boolean | undefined
}

const MIN_SUPPORTED_REDIS_VERSION = '7.2.0'
const REDISEARCH_MODULE_SET = new Set(REDISEARCH_MODULES)

const useRedisInstanceCompatibility =
  (): UseRedisInstanceCompatibilityReturn => {
    const { version } = useSelector(connectedInstanceInfoSelector)

    const { loading, modules = [] } = useSelector(connectedInstanceSelector)

    const isInitialized = loading !== undefined

    const redisearchPresent = useMemo(
      () => modules?.some((m) => REDISEARCH_MODULE_SET.has(m.name)),
      [modules],
    )

    return {
      loading,
      hasRedisearch: isInitialized ? redisearchPresent : undefined,
      hasSupportedVersion:
        isInitialized && version
          ? isRedisVersionSupported(version, MIN_SUPPORTED_REDIS_VERSION)
          : undefined,
    }
  }

export default useRedisInstanceCompatibility
