import React from 'react'
import { Switch } from 'react-router-dom'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'
import { IRoute } from 'uiSrc/constants'

export interface Props {
  routes: IRoute[]
}
const VectorSearchPageRouter = ({ routes }: Props) => (
  <Switch>
    {routes.map((route, i) => (
      <RouteWithSubRoutes key={i} {...route} />
    ))}
  </Switch>
)

export default React.memo(VectorSearchPageRouter)
