import { ConnectionProvider, ConnectionType } from 'uiSrc/slices/interfaces'
import { AzureAuthType } from 'uiSrc/slices/interfaces/azure'
import { Instance } from 'uiSrc/slices/interfaces/instances'

import {
  REDIS_TOOLS_DEFAULT_USERNAME,
  REDIS_TOOLS_INIT_COMMAND,
  REDIS_TOOLS_RADAR_URL,
  REDIS_TOOLS_UTM_PARAMS,
} from './RedisTools.constants'
import { InitTarget, InitTargetKind, UrlConnection } from './RedisTools.types'

const SAFE_SHELL_ARG = /^[\w.:/@-]+$/

const quoteShellArgAlways = (value: string): string =>
  `'${value.replace(/'/g, `'\\''`)}'`

const quoteShellArg = (value: string): string =>
  SAFE_SHELL_ARG.test(value) ? value : quoteShellArgAlways(value)

const formatHost = (host: string): string =>
  host.includes(':') ? `[${host}]` : host

// A password of undefined omits credentials; any string (including a mask or
// placeholder) renders the password segment.
export const buildConnectionUrl = (
  { host, port, tls, username, db }: UrlConnection,
  password?: string,
  shouldEncodePassword = true,
): string => {
  const scheme = tls ? 'rediss' : 'redis'
  const dbIndex = db ? `/${db}` : ''
  let auth = ''

  if (password !== undefined) {
    const user = encodeURIComponent(username || REDIS_TOOLS_DEFAULT_USERNAME)
    const secret = shouldEncodePassword
      ? encodeURIComponent(password)
      : password
    auth = `${user}:${secret}@`
  } else if (username) {
    auth = `${encodeURIComponent(username)}@`
  }

  return `${scheme}://${auth}${formatHost(host)}:${port}${dbIndex}`
}

// Returns the init target for a database, or null when the connection cannot
// be expressed in a URL (cluster, sentinel, SSH, client or custom CA certs,
// Azure Entra ID, whose credentials are temporary tokens).
// The password is never read here; the caller supplies it when needed.
export const resolveInitTarget = (
  instance: Partial<Instance>,
): InitTarget | null => {
  const {
    name,
    host,
    port,
    provider,
    connectionType,
    ssh,
    tls,
    caCert,
    tlsClientAuthRequired,
    providerDetails,
    username,
    db,
    password,
  } = instance

  if (!name) return null

  if (
    (providerDetails as { authType?: string } | undefined)?.authType ===
    AzureAuthType.EntraId
  ) {
    return null
  }

  if (provider === ConnectionProvider.REDIS_CLOUD) {
    return { kind: InitTargetKind.Cloud, name }
  }

  const isPlainStandalone =
    connectionType === ConnectionType.Standalone &&
    !ssh &&
    !tlsClientAuthRequired &&
    !(tls && caCert)

  if (!isPlainStandalone || !host || !port) return null

  return {
    kind: InitTargetKind.Url,
    name,
    connection: {
      host,
      port,
      tls: !!tls,
      username: username || undefined,
      db: db || undefined,
      hasPassword: !!password,
    },
  }
}

export const buildInitCommand = (
  target?: InitTarget | null,
  password?: string,
  shouldEncodePassword = true,
): string => {
  if (!target) return REDIS_TOOLS_INIT_COMMAND

  const name = quoteShellArg(target.name)

  if (target.kind === InitTargetKind.Cloud) {
    return `${REDIS_TOOLS_INIT_COMMAND} --cloud --name ${name}`
  }

  const url = buildConnectionUrl(
    target.connection,
    target.connection.hasPassword ? password : undefined,
    shouldEncodePassword,
  )

  return `${REDIS_TOOLS_INIT_COMMAND} --url ${quoteShellArgAlways(url)} --name ${name}`
}
export const buildRadarUrl = (): string =>
  `${REDIS_TOOLS_RADAR_URL}?${REDIS_TOOLS_UTM_PARAMS}`
