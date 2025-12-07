import React from 'react'
import { Switch } from 'react-router-dom'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'

export interface Props {
  routes: any[]
}
const RedisCloudPage = ({ routes = [] }: Props) => (
  <Switch>
    {routes.map((route, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <RouteWithSubRoutes key={i} {...route} />
    ))}
  </Switch>
)

export default RedisCloudPage
