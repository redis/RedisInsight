import axios from 'axios'
import { CustomHeaders } from 'uiSrc/constants/api'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import { getConfig } from 'uiSrc/config'

const riConfig = getConfig()

const { apiPort } = window.app?.config || { apiPort: riConfig.api.port }
const isDevelopment = riConfig.app.env === 'development'
const isWebApp = riConfig.app.type === 'web'
const hostedApiBaseUrl = riConfig.api.hostedBaseUrl

let BASE_URL =
  !isDevelopment && isWebApp ? '/' : `${riConfig.api.baseUrl}:${apiPort}/`

if (window.__RI_PROXY_PATH__) {
  BASE_URL = `${BASE_URL}${window.__RI_PROXY_PATH__}/`
}

export const RESOURCES_BASE_URL = BASE_URL

const resourcesService = axios.create({
  baseURL: hostedApiBaseUrl || RESOURCES_BASE_URL,
  withCredentials: !!hostedApiBaseUrl,
})

export const setResourceCsrfHeader = (token: string) => {
  resourcesService.defaults.headers.common[CustomHeaders.CsrfToken] = token
}

// TODO: it seems it's shoudn't be location.origin
// TODO: check all cases and rename this to getResourcesUrl
// TODO: also might be helpful create function which returns origin url
export const getOriginUrl = () =>
  IS_ABSOLUTE_PATH.test(RESOURCES_BASE_URL)
    ? RESOURCES_BASE_URL
    : window?.location?.origin || RESOURCES_BASE_URL

export const getPathToResource = (url: string = ''): string => {
  try {
    return IS_ABSOLUTE_PATH.test(url)
      ? url
      : new URL(url, getOriginUrl()).toString()
  } catch {
    return ''
  }
}

export const checkResourse = async (url: string = '') =>
  resourcesService.head(url)

const localResourcesService = axios.create({
  baseURL: riConfig.app.localResourcesBaseUrl,
  withCredentials: false,
})

export default riConfig.app.useLocalResources
  ? localResourcesService
  : resourcesService
