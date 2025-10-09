import semver from 'semver'

export const isVersionHigherOrEquals = (
  sourceVersion: string = '',
  comparableVersion: string = '',
) => {
  const sourceVersionArray = sourceVersion.split('.')
  const comparableVersionArray = comparableVersion.split('.')

  for (
    let i = 0;
    i <=
    Math.max(sourceVersionArray.length - 1, comparableVersionArray.length - 1);
    i++
  ) {
    const n1 = parseInt(sourceVersionArray[i] || '0')
    const n2 = parseInt(comparableVersionArray[i] || '0')

    if (n1 > n2) return true
    if (n2 > n1) return false
  }

  return true
}

export const isVersionHigher = (
  sourceVersion: string = '',
  comparableVersion: string = '',
) => {
  const sourceVersionArray = sourceVersion.split('.')
  const comparableVersionArray = comparableVersion.split('.')

  for (
    let i = 0;
    i <=
    Math.max(sourceVersionArray.length - 1, comparableVersionArray.length - 1);
    i++
  ) {
    const n1 = parseInt(sourceVersionArray[i] || '0')
    const n2 = parseInt(comparableVersionArray[i] || '0')

    if (n1 > n2) return true
    if (n2 > n1) return false
  }

  return false
}

export const isRedisVersionSupported = (
  raw: string,
  minVersion: string,
): boolean => {
  // Try a loose/full parse of the whole string first.
  // This returns a normalized version string like "7.2.0" or null if not recognizable.
  const vLoose = semver.valid(raw, { loose: true })
  if (vLoose) return semver.satisfies(vLoose, `>=${minVersion}`)

  // Fallback: try to coerce a version from arbitrary text,
  // e.g. "Redis 7.2.1" -> SemVer { version: '7.2.1' }
  const coerced = semver.coerce(raw)
  if (!coerced) {
    return false
  }

  return semver.gte(coerced, minVersion)
}
