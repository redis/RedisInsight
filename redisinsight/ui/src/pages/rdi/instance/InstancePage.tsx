import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import {
  appContextSelector,
  resetDatabaseContext,
  resetRdiContext,
  setAppContextConnectedRdiInstanceId,
} from 'uiSrc/slices/app/context'
import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import {
  fetchConnectedInstanceAction,
  fetchInstancesAction as fetchRdiInstancesAction,
  instancesSelector as rdiInstancesSelector,
} from 'uiSrc/slices/rdi/instances'
import {
  fetchInstancesAction,
  instancesSelector as dbInstancesSelector,
  resetConnectedInstance as resetConnectedDatabaseInstance,
} from 'uiSrc/slices/instances/instances'

import { RdiInstancePageTemplate } from 'uiSrc/templates'
import { AppNavigation, RdiInstanceHeader } from 'uiSrc/components'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import InstancePageRouter from './InstancePageRouter'
import { RdiPipelineHeader } from './components'
import styles from './styles.module.scss'
import { Nullable } from 'uiSrc/utils'
import { useNavigation } from 'uiSrc/components/navigation-menu/hooks/useNavigation'

export interface Props {
  routes: IRoute[]
}

const RdiInstancePage = ({ routes = [] }: Props) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { pathname } = useLocation()
  const { privateRdiRoutes } = useNavigation()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { lastPage, contextRdiInstanceId } = useSelector(appContextSelector)
  const { data: rdiInstances } = useSelector(rdiInstancesSelector)
  const { data: dbInstances } = useSelector(dbInstancesSelector)

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
      history.push(Pages.rdiPipelineManagement(rdiInstanceId))
    }
  }, [])

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
