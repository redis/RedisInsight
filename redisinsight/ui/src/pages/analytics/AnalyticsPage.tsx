import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams, useLocation } from 'react-router-dom'
import { Pages } from 'uiSrc/constants'
import {
  appContextAnalytics,
  setLastAnalyticsPage,
} from 'uiSrc/slices/app/context'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { useConnectionType } from 'uiSrc/components/hooks/useConnectionType'

import AnalyticsPageRouter from './AnalyticsPageRouter'

export interface Props {
  routes: any[]
}

const AnalyticsPage = ({ routes = [] }: Props) => {
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()
  const { pathname } = useLocation()
  const connectionType = useConnectionType()
  const { lastViewedPage } = useSelector(appContextAnalytics)
  const pathnameRef = useRef<string>('')

  const dispatch = useDispatch()

  useEffect(
    () => () => {
      dispatch(setLastAnalyticsPage(pathnameRef.current))
    },
    [],
  )

  useEffect(() => {
    if (
      pathname === Pages.clusterDetails(instanceId) &&
      connectionType !== ConnectionType.Cluster
    ) {
      history.push(Pages.databaseAnalysis(instanceId))
      return
    }

    if (pathname === Pages.analytics(instanceId)) {
      // restore current inner page and ignore context (as we store context on unmount)
      if (pathnameRef.current && pathnameRef.current !== lastViewedPage) {
        history.push(pathnameRef.current)
        return
      }

      // restore from context
      if (lastViewedPage) {
        history.push(lastViewedPage)
        return
      }

      history.push(
        connectionType === ConnectionType.Cluster
          ? Pages.clusterDetails(instanceId)
          : Pages.databaseAnalysis(instanceId),
      )
    }

    pathnameRef.current =
      pathname === Pages.analytics(instanceId) ? '' : pathname
  }, [pathname])

  return <AnalyticsPageRouter routes={routes} />
}

export default AnalyticsPage
