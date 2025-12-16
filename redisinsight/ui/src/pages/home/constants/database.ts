export enum AddDbType {
  manual,
  cloud,
  sentinel,
  software,
  import,
  azure,
}

export enum CloudConnectionOptions {
  Account = 'cloud-account',
  ApiKeys = 'cloud-api-keys',
}

export const CREATE_CLOUD_DB_ID = 'create-free-cloud-db'
