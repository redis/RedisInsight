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
import { Nullable } from 'uiSrc/utils'
import { shouldUseRdiUiPipeline } from 'uiSrc/utils/rdi'

import { RdiInstancePageTemplate } from 'uiSrc/templates'
import { AppNavigation, RdiInstanceHeader } from 'uiSrc/components'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { useNavigation } from 'uiSrc/components/navigation-menu/hooks/useNavigation'
import InstancePageRouter from './InstancePageRouter'
import { RdiPipelineHeader } from './components'
import styles from './styles.module.scss'

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
      // `id` only matches `rdiInstanceId` once that fetch actually succeeds.
      // `contextRdiInstanceId === rdiInstanceId` confirms the store has
      // already processed *this* instance's reset+fetch cycle (it's set in
      // the same effect, synchronously) - without it, a stale `error` left
      // over from a previously viewed instance would look like "this
      // instance failed to load" on the very first render and push to
      // legacy before the real fetch ever gets a chance to resolve.
      const isSameInstanceContext = contextRdiInstanceId === rdiInstanceId
      const isConnectedInstanceReady =
        isSameInstanceContext && connectedInstance.id === rdiInstanceId
      const hasFailedToLoad =
        isSameInstanceContext &&
        !connectedInstance.loading &&
        !!connectedInstance.error &&
        !isConnectedInstanceReady

      if (!isConnectedInstanceReady && !hasFailedToLoad) {
        return
      }

      const shouldUseRdiUi =
        isConnectedInstanceReady &&
        shouldUseRdiUiPipeline(
          connectedInstance.version ?? '',
          isDevRdiUiEnabled,
        )

      history.push(
        shouldUseRdiUi
          ? Pages.rdiPipelineManagementV2(rdiInstanceId)
          : Pages.rdiPipelineManagement(rdiInstanceId),
      )
    }
  }, [
    contextRdiInstanceId,
    connectedInstance.id,
    connectedInstance.error,
    connectedInstance.loading,
  ])

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
