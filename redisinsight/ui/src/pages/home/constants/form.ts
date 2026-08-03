import { ParseKeys } from 'i18next'
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

export const fieldDisplayNames: Record<string, ParseKeys> = {
  port: 'home.form.field.port',
  host: 'home.form.field.host',
  name: 'home.form.field.name',
  selectedCaCertName: 'home.form.field.selectedCaCertName',
  newCaCertName: 'home.form.field.newCaCertName',
  newCaCert: 'home.form.field.newCaCert',
  newTlsCertPairName: 'home.form.field.newTlsCertPairName',
  newTlsClientCert: 'home.form.field.newTlsClientCert',
  newTlsClientKey: 'home.form.field.newTlsClientKey',
  servername: 'home.form.field.servername',
  sentinelMasterName: 'home.form.field.sentinelMasterName',
  sshHost: 'home.form.field.sshHost',
  sshPort: 'home.form.field.sshPort',
  sshPrivateKey: 'home.form.field.sshPrivateKey',
  sshUsername: 'home.form.field.sshUsername',
}

export const DEFAULT_TIMEOUT = getConfig().database.defaultConnectionTimeout

export enum SubmitBtnText {
  AddDatabase = 'home.form.button.addDatabase',
  EditDatabase = 'home.form.button.editDatabase',
  CloneDatabase = 'home.form.button.cloneDatabase',
}
