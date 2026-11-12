import { Maybe, Nullable } from 'uiSrc/utils/types'

/*
  [redis[s]://]             - Optional Protocol (redis or rediss)
  [username][:password]@    - Optional username and password
  host                      - Hostname or IP address (IPv6 in square brackets)
  [:port]                   - Optional port
  [/db-number]              - Optional database number
*/

interface ParsedRedisUrl {
  protocol: string
  username: string
  password: string
  host: string
  port: Maybe<number>
  hostname: Maybe<string>
  dbNumber: Maybe<number>
}

// [::1] => ::1
const unwrapIpv6Host = (host: string) => host.replace(/^\[(.*)\]$/, '$1')

// URL validates bracketed IPv6 hosts, so [] or [abc] are rejected
const isValidIpv6Host = (host: string) => {
  try {
    return !!new URL(`http://${host}`).hostname
  } catch {
    return false
  }
}

const isValidHost = (host: string) =>
  !host.startsWith('[') || isValidIpv6Host(host)

const parseRedisUrl = (urlString: string = ''): Nullable<ParsedRedisUrl> => {
  const pureUrlPattern = /^(\[[^\]]+\]|[^:]+):(\d+)$/
  const pureMatch = urlString.match(pureUrlPattern)

  if (pureMatch) {
    const [, host, port] = pureMatch
    if (!isValidHost(host)) {
      return null
    }

    const unwrappedHost = unwrapIpv6Host(host)
    return {
      protocol: 'redis',
      username: '',
      password: '',
      host: unwrappedHost,
      port: port ? parseInt(port, 10) : undefined,
      hostname: port ? `${unwrappedHost}:${port}` : unwrappedHost,
      dbNumber: undefined,
    }
  }

  const redisUrlPattern =
    /^(redis[s]?):\/\/(?:(.+)?@)?(?:.*@)?(\[[^\]/]+\]|[^:/]+)(?::(\d+))?(?:\/(\d+))?$/
  const match = urlString.match(redisUrlPattern)

  if (!match) {
    return null
  }

  const [, protocol, userInfo, host, port, dbNumber] = match
  if (!isValidHost(host)) {
    return null
  }

  const [, username, password] = userInfo?.match(/^(.*?)(?::(.*))?$/) || []

  const unwrappedHost = unwrapIpv6Host(host)

  return {
    protocol: protocol || 'redis',
    username: username || '',
    password: password || '',
    host: unwrappedHost,
    port: port ? parseInt(port, 10) : undefined,
    // same "host:port" format the API uses for default database names
    hostname: port ? `${unwrappedHost}:${port}` : unwrappedHost,
    dbNumber: dbNumber ? parseInt(dbNumber, 10) : undefined,
  }
}

export { parseRedisUrl }
