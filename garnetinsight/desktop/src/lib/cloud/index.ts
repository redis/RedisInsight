import { initCloudOauthHandlers } from 'desktopSrc/lib/cloud/cloud-oauth.handlers'

export * from './deep-link.handlers'

export const initCloudHandlers = () => {
  initCloudOauthHandlers()
}
