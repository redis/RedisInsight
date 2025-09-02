import semver from 'semver'
import { useSelector } from 'react-redux'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { REDISEARCH_MODULES } from 'uiSrc/slices/interfaces'

export type UseRedisInstanceCompatibilityReturn = {
  loading: boolean | undefined
  hasRedisearch: boolean | undefined
  hasSupportedVersion: boolean | undefined
}

const MIN_SUPPORTED_REDIS_VERSION = '7.2.0'
const REDISEARCH_MODULE_SET = new Set(REDISEARCH_MODULES)

export const isVersionSupported = (raw: string): boolean => {
  // Try a loose/full parse of the whole string first.
  // This returns a normalized version string like "7.2.0" or null if not recognizable.
  const vLoose = semver.valid(raw, { loose: true })
  if (vLoose)
    return semver.satisfies(vLoose, `>=${MIN_SUPPORTED_REDIS_VERSION}`)

  // Fallback: try to coerce a version from arbitrary text,
  // e.g. "Redis 7.2.1" -> SemVer { version: '7.2.1' }
  const coerced = semver.coerce(raw)
  if (!coerced) {
    return false
  }

  return semver.gte(coerced, MIN_SUPPORTED_REDIS_VERSION)
}

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
        !loading && version ? isVersionSupported(version) : undefined,
    }
  }

export default useRedisInstanceCompatibility
