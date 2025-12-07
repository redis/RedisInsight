import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'
import { Pages } from 'uiSrc/constants'

export interface Props {
  routes: any[]
}
const InstancePageRouter = ({ routes }: Props) => (
  <Switch>
    {routes.map((route, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <RouteWithSubRoutes key={i} {...route} />
    ))}
    <Route path="*" render={() => <Redirect to={Pages.notFound} />} />
  </Switch>
)

export default React.memo(InstancePageRouter)
