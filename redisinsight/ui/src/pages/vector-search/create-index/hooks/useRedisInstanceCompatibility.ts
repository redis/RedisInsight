import { useSelector } from 'react-redux'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
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
    const {
      loading,
      modules = [],
      version,
    } = useSelector(connectedInstanceSelector)

    const hasRedisearch = modules?.some((m) =>
      REDISEARCH_MODULE_SET.has(m.name),
    )

    return {
      loading,
      hasRedisearch: !loading ? hasRedisearch : undefined,
      hasSupportedVersion:
        !loading && version
          ? isRedisVersionSupported(version, MIN_SUPPORTED_REDIS_VERSION)
          : undefined,
    }
  }

export default useRedisInstanceCompatibility
