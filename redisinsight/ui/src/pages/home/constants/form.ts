import { getConfig } from 'uiSrc/config'

export const ADD_NEW_CA_CERT = 'ADD_NEW_CA_CERT'
export const NO_CA_CERT = 'NO_CA_CERT'
export const ADD_NEW = 'ADD_NEW'
export const NONE = 'NONE'
export const DEFAULT_HOST = '127.0.0.1'
export const DEFAULT_PORT = '6379'
export const DEFAULT_ALIAS = `${DEFAULT_HOST}:${DEFAULT_PORT}`

export enum SshPassType {
  Password = 'password',
  PrivateKey = 'privateKey',
}

export const fieldDisplayNames = {
  port: 'Port',
  host: 'Host',
  name: 'Database alias',
  selectedCaCertName: 'CA certificate',
  newCaCertName: 'CA certificate name',
  newCaCert: 'CA certificate',
  newTlsCertPairName: 'Client certificate name',
  newTlsClientCert: 'Client certificate',
  newTlsClientKey: 'Private key',
  servername: 'Server name',
  sentinelMasterName: 'Primary group name',
  sshHost: 'SSH host',
  sshPort: 'SSH port',
  sshPrivateKey: 'SSH private key',
  sshUsername: 'SSH username',
}

export const DEFAULT_TIMEOUT = getConfig().database.defaultConnectionTimeout

export enum SubmitBtnText {
  AddDatabase = 'Add Redis database',
  EditDatabase = 'Apply changes',
  CloneDatabase = 'Clone database',
}
