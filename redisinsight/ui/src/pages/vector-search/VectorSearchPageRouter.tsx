import React from 'react'
import { Switch } from 'react-router-dom'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'

import { VectorSearchPageRouterProps } from './VectorSearchPageRouter.types'

/**
 * Router component for Vector Search pages.
 * Handles routing between main page, create index, and query pages.
 */
export const VectorSearchPageRouter = ({
  routes,
}: VectorSearchPageRouterProps) => (
  <Switch>
    {routes.map((route, i) => (
      <RouteWithSubRoutes key={i} {...route} />
    ))}
  </Switch>
)

export default React.memo(VectorSearchPageRouter)
