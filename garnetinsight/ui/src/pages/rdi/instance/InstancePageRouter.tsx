import React from 'react'
import { Switch } from 'react-router-dom'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'
import { IRoute } from 'uiSrc/constants'

export interface Props {
  routes: IRoute[]
}
const InstancePageRouter = ({ routes }: Props) => (
  <Switch>
    {routes.map((route) => (
      <RouteWithSubRoutes key={Math.random()} {...route} />
    ))}
  </Switch>
)

export default React.memo(InstancePageRouter)
