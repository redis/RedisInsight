import semver from 'semver'
import { useSelector } from 'react-redux'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { REDISEARCH_MODULES } from 'uiSrc/slices/interfaces'

export type UseRedisInstanceCompatibilityReturn = {
  loading: boolean | undefined
  hasRedisearch: boolean | null
  hasSupportedVersion: boolean | null
}

const MIN_SUPPORTED_REDIS_VERSION = '7.2.0'
const REDISEARCH_MODULE_SET = new Set(REDISEARCH_MODULES)

export const isVersionSupported = (raw?: string | null) => {
  if (!raw) return null

  const vLoose = semver.valid(raw, { loose: true })
  if (vLoose)
    return semver.satisfies(vLoose, `>=${MIN_SUPPORTED_REDIS_VERSION}`)

  const coerced = semver.coerce(raw)
  if (!coerced) return null

  return semver.gte(coerced, MIN_SUPPORTED_REDIS_VERSION)
}

const useRedisInstanceCompatibility =
  (): UseRedisInstanceCompatibilityReturn => {
    const {
      loading,
      modules = [],
      version,
    } = useSelector(connectedInstanceSelector)

    const hasRedisearch = modules
      ? modules.some((m) => REDISEARCH_MODULE_SET.has(m.name))
      : null

    return {
      loading,
      hasRedisearch,
      hasSupportedVersion: isVersionSupported(version),
    }
  }

export default useRedisInstanceCompatibility
