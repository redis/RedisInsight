import { Nullable } from 'uiSrc/utils'

export enum UrlHandlingActions {
  Connect = 'databases/connect',
  Open = 'open',
}
export interface StateUrlHandling {
  fromUrl: Nullable<string>
  returnUrl: Nullable<string>
  action: Nullable<UrlHandlingActions>
  dbConnection: Nullable<any>
  properties: Record<string, any>
}
