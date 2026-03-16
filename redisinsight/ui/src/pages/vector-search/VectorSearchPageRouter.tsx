import React from 'react'
import { Switch } from 'react-router-dom'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'
import { Loader } from 'uiSrc/components/base/display'

import { VectorSearchPageRouterProps } from './VectorSearchPageRouter.types'
import { VectorSearchProvider } from './context/vector-search'
import { useRedisInstanceCompatibility } from './hooks'
import { RqeNotAvailable } from './components/rqe-not-available'
import * as S from './pages/styles'

/**
 * Router component for Vector Search pages.
 * Handles routing between main page, create index, and query pages.
 * Guards all sub-routes against missing RediSearch module.
 * Wrapped with VectorSearchProvider to supply global context (modal, shared actions).
 */
export const VectorSearchPageRouter = ({
  routes,
}: VectorSearchPageRouterProps) => {
  const { hasRedisearch, loading } = useRedisInstanceCompatibility()

  if (loading !== false) {
    return (
      <S.PageWrapper
        data-testid="vector-search-page--loading"
        align="center"
        justify="center"
      >
        <Loader size="xl" data-testid="vector-search-loader" />
      </S.PageWrapper>
    )
  }

  if (hasRedisearch === false) {
    return (
      <S.PageWrapper data-testid="vector-search-page--rqe-not-available">
        <RqeNotAvailable />
      </S.PageWrapper>
    )
  }

  return (
    <VectorSearchProvider>
      <Switch>
        {routes.map((route) => (
          <RouteWithSubRoutes key={route.path} {...route} />
        ))}
      </Switch>
    </VectorSearchProvider>
  )
}

export default React.memo(VectorSearchPageRouter)
