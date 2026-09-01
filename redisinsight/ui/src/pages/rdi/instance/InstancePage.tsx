import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import {
  appContextSelector,
  resetDatabaseContext,
  resetRdiContext,
  setAppContextConnectedRdiInstanceId,
} from 'uiSrc/slices/app/context'
import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import {
  connectedInstanceSelector,
  fetchConnectedInstanceAction,
  fetchInstancesAction as fetchRdiInstancesAction,
  instancesSelector as rdiInstancesSelector,
} from 'uiSrc/slices/rdi/instances'
import {
  fetchInstancesAction,
  instancesSelector as dbInstancesSelector,
  resetConnectedInstance as resetConnectedDatabaseInstance,
} from 'uiSrc/slices/instances/instances'
import { isDevRdiUiEnabledSelector } from 'uiSrc/slices/app/features'
import { getConfig } from 'uiSrc/config'
import { isVersionHigher, Nullable } from 'uiSrc/utils'

import { RdiInstancePageTemplate } from 'uiSrc/templates'
import { AppNavigation, RdiInstanceHeader } from 'uiSrc/components'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { useNavigation } from 'uiSrc/components/navigation-menu/hooks/useNavigation'
import InstancePageRouter from './InstancePageRouter'
import { RdiPipelineHeader } from './components'
import styles from './styles.module.scss'

const riConfig = getConfig()

export interface Props {
  routes: IRoute[]
}

const RdiInstancePage = ({ routes = [] }: Props) => {
  const dispatch = useAppDispatch()
  const history = useHistory()
  const { pathname } = useLocation()
  const { privateRdiRoutes } = useNavigation()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { lastPage, contextRdiInstanceId } = useAppSelector(appContextSelector)
  const { data: rdiInstances } = useAppSelector(rdiInstancesSelector)
  const { data: dbInstances } = useAppSelector(dbInstancesSelector)
  const connectedInstance = useAppSelector(connectedInstanceSelector)
  const isDevRdiUiEnabled = useAppSelector(isDevRdiUiEnabledSelector)

  const [actions, setActions] = useState<Nullable<React.ReactNode>>(null)

  useEffect(() => {
    if (!dbInstances?.length) {
      dispatch(fetchInstancesAction())
    }
    if (!rdiInstances?.length) {
      dispatch(fetchRdiInstancesAction())
    }
  }, [])

  useEffect(() => {
    if (!contextRdiInstanceId || contextRdiInstanceId !== rdiInstanceId) {
      dispatch(resetRdiContext())
      dispatch(fetchConnectedInstanceAction(rdiInstanceId))
    }
    dispatch(setAppContextConnectedRdiInstanceId(rdiInstanceId))

    // clear database context
    dispatch(resetConnectedDatabaseInstance())
    dispatch(resetDatabaseContext())
  }, [rdiInstanceId])

  useEffect(() => {
    // redirect only if there is no exact path
    if (pathname === Pages.rdiPipeline(rdiInstanceId)) {
      if (
        lastPage === PageNames.rdiStatistics &&
        contextRdiInstanceId === rdiInstanceId
      ) {
        history.push(Pages.rdiStatistics(rdiInstanceId))
        return
      }

      // The connected instance (incl. version) loads asynchronously above.
      // `id` only matches `rdiInstanceId` once that fetch actually succeeds,
      // so wait for it rather than deciding v1 vs v2 off stale/empty data.
      const isConnectedInstanceReady = connectedInstance.id === rdiInstanceId
      if (!isConnectedInstanceReady && !connectedInstance.error) {
        return
      }

      const shouldUseRdiUi =
        isConnectedInstanceReady &&
        isDevRdiUiEnabled &&
        isVersionHigher(
          connectedInstance.version,
          riConfig.features.rdiUi.minSupportedVersion,
        )

      history.push(
        shouldUseRdiUi
          ? Pages.rdiPipelineManagementV2(rdiInstanceId)
          : Pages.rdiPipelineManagement(rdiInstanceId),
      )
    }
  }, [connectedInstance.id, connectedInstance.error])

  return (
    <Col className={styles.page} gap="none" responsive={false}>
      <FlexItem>
        <RdiInstanceHeader />
      </FlexItem>
      <FlexItem>
        <AppNavigation
          actions={actions}
          onChange={() => setActions(null)}
          routes={privateRdiRoutes}
        />
      </FlexItem>
      <FlexItem grow={false}>
        <RdiPipelineHeader />
      </FlexItem>
      <RdiInstancePageTemplate>
        <InstancePageRouter routes={routes} />
      </RdiInstancePageTemplate>
    </Col>
  )
}

export default RdiInstancePage
