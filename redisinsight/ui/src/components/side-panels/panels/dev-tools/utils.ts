import { ConnectionProvider, ConnectionType } from 'uiSrc/slices/interfaces'
import { Instance } from 'uiSrc/slices/interfaces/instances'

import {
  DEV_TOOLS_INIT_COMMAND,
  DEV_TOOLS_RADAR_URL,
  DEV_TOOLS_UTM_PARAMS,
} from './DevTools.constants'
import { InitTarget, InitTargetKind } from './DevTools.types'

const SAFE_SHELL_ARG = /^[\w.:/@-]+$/

const quoteShellArg = (value: string): string =>
  SAFE_SHELL_ARG.test(value) ? value : `'${value.replace(/'/g, `'\\''`)}'`

const formatHost = (host: string): string =>
  host.includes(':') ? `[${host}]` : host

const buildConnectionUrl = ({
  host,
  port,
  tls,
  username,
  db,
}: Instance): string => {
  const scheme = tls ? 'rediss' : 'redis'
  const auth = username ? `${encodeURIComponent(username)}@` : ''
  const dbIndex = db ? `/${db}` : ''

  return `${scheme}://${auth}${formatHost(host)}:${port}${dbIndex}`
}

// Returns the init target for a database, or null when the connection cannot
// be expressed in a URL (cluster, sentinel, SSH, client or custom CA certs).
// Credentials are never read, so the URL carries no password.
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
  } = instance

  if (!name) return null

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
    url: buildConnectionUrl(instance as Instance),
  }
}

export const buildInitCommand = (target?: InitTarget | null): string => {
  if (!target) return DEV_TOOLS_INIT_COMMAND

  const name = quoteShellArg(target.name)

  return target.kind === InitTargetKind.Cloud
    ? `${DEV_TOOLS_INIT_COMMAND} --cloud --name ${name}`
    : `${DEV_TOOLS_INIT_COMMAND} --url ${quoteShellArg(target.url)} --name ${name}`
}

export const buildRadarUrl = (): string =>
  `${DEV_TOOLS_RADAR_URL}?${DEV_TOOLS_UTM_PARAMS}`
