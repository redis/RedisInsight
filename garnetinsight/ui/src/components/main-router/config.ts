import { IRoute } from 'uiSrc/constants'
import { getConfig } from 'uiSrc/config'

const riConfig = getConfig()

export const LAZY_LOAD = riConfig?.app?.lazyLoad

export const ROUTES_EXCLUDED_BY_ENV = riConfig?.app?.routesExcludedByEnv

export const getRouteIncludedByEnv = (routeDefinition: IRoute[]) => {
  if (ROUTES_EXCLUDED_BY_ENV) {
    return []
  }

  return routeDefinition
}
