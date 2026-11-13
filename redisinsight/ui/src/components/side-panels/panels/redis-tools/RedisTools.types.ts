export enum InitTargetKind {
  Cloud = 'cloud',
  Url = 'url',
}

export interface UrlConnection {
  host: string
  port: number
  tls: boolean
  username?: string
  db?: number
  hasPassword: boolean
}

export type InitTarget =
  | { kind: InitTargetKind.Cloud; name: string }
  | {
      kind: InitTargetKind.Url
      name: string
      connection: UrlConnection
    }
