import React from 'react'
import { Switch } from 'react-router-dom'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'
import { AzureAutodiscoveryProvider } from '../contexts'

export interface Props {
  routes: any[]
}

const AzurePage = ({ routes = [] }: Props) => (
  <AzureAutodiscoveryProvider>
    <Switch>
      {routes.map((route, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <RouteWithSubRoutes key={i} {...route} />
      ))}
    </Switch>
  </AzureAutodiscoveryProvider>
)

export default AzurePage
