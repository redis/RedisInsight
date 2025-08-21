import React from 'react'
import { Switch } from 'react-router-dom'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'
import { IRoute } from 'uiSrc/constants'

export interface Props {
  routes: IRoute[]
}
const PipelineManagementPageRouter = ({ routes }: Props) => (
  <Switch>
    {routes.map((route, i) => (
      <RouteWithSubRoutes key={`pipeline-management-route-${i}`} {...route} />
    ))}
  </Switch>
)

export default React.memo(PipelineManagementPageRouter)
