import { Maybe, Nullable } from 'uiSrc/utils/types'

/*
  [redis[s]://]             - Optional Protocol (redis or rediss)
  [username][:password]@    - Optional username and password
  host                      - Hostname or IP address
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

const parseRedisUrl = (urlString: string = ''): Nullable<ParsedRedisUrl> => {
  const pureUrlPattern = /^([^:]+):(\d+)$/
  const pureMatch = urlString.match(pureUrlPattern)

  if (pureMatch) {
    const [, host, port] = pureMatch
    return {
      protocol: 'redis',
      username: '',
      password: '',
      host,
      port: port ? parseInt(port, 10) : undefined,
      hostname: port ? `${host}:${port}` : host,
      dbNumber: undefined,
    }
  }

  // eslint-disable-next-line no-useless-escape
  const redisUrlPattern =
    /^(redis[s]?):\/\/(?:(.+)?@)?(?:.*@)?([^:\/]+)(?::(\d+))?(?:\/(\d+))?$/
  const match = urlString.match(redisUrlPattern)

  if (!match) {
    return null
  }

  const [, protocol, userInfo, host, port, dbNumber] = match
  const [, username, password] = userInfo?.match(/^(.*?)(?::(.*))?$/) || []

  return {
    protocol: protocol || 'redis',
    username: username || '',
    password: password || '',
    host,
    port: port ? parseInt(port, 10) : undefined,
    hostname: port ? `${host}:${port}` : host,
    dbNumber: dbNumber ? parseInt(dbNumber, 10) : undefined,
  }
}

export { parseRedisUrl }
