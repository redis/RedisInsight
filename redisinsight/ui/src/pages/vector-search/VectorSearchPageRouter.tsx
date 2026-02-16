import React from 'react'
import { Switch } from 'react-router-dom'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'

import { VectorSearchPageRouterProps } from './VectorSearchPageRouter.types'
import { VectorSearchProvider } from './context/vector-search'

/**
 * Router component for Vector Search pages.
 * Handles routing between main page, create index, and query pages.
 * Wrapped with VectorSearchProvider to supply global context (modal, shared actions).
 */
export const VectorSearchPageRouter = ({
  routes,
}: VectorSearchPageRouterProps) => (
  <VectorSearchProvider>
    <Switch>
      {routes.map((route, i) => (
        <RouteWithSubRoutes key={i} {...route} />
      ))}
    </Switch>
  </VectorSearchProvider>
)

export default React.memo(VectorSearchPageRouter)
