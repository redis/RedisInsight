import { useDispatch } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { Switch, useHistory } from 'react-router-dom'

import {
  checkConnectToInstanceAction,
  resetConnectedInstance,
  setConnectedInstanceId,
} from 'uiSrc/slices/instances/instances'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'
import { Pages } from 'uiSrc/constants'
import { PagePlaceholder } from 'uiSrc/components'
import ProtectedRoute from 'uiSrc/pages/redis-stack/components/protected-route/ProtectedRoute'
import ROUTES from '../constants/redisStackRoutes'

interface IProps {
  databaseId?: string
}

interface IConnectionState {
  loading: boolean
  ready: boolean
}

const Router = ({ databaseId = '' }: IProps) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const [connection, setConnection] = useState<IConnectionState>({
    loading: true,
    ready: false,
  })

  const handleSuccess = (id: string) => {
    dispatch(setConnectedInstanceId(id))
    setConnection({ loading: false, ready: false })
    history.push(Pages.browser(databaseId))
  }

  const handleFail = () => {
    dispatch(resetConnectedInstance())
    setConnection({ loading: false, ready: false })
  }

  useEffect(() => {
    dispatch(
      checkConnectToInstanceAction(
        databaseId,
        () => handleSuccess(databaseId),
        handleFail,
      ),
    )
  }, [])

  return connection.loading ? (
    <PagePlaceholder />
  ) : (
    <Switch>
      {ROUTES.map((route, i) =>
        route.protected ? (
          // eslint-disable-next-line react/no-array-index-key
          <ProtectedRoute key={i}>
            <RouteWithSubRoutes {...route} />
          </ProtectedRoute>
        ) : (
          // eslint-disable-next-line react/no-array-index-key
          <RouteWithSubRoutes key={i} {...route} />
        ),
      )}
    </Switch>
  )
}

export default Router
