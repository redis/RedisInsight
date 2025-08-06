import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { RiCol, RiFlexItem } from 'uiBase/layout'
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
import { RdiInstanceHeader } from 'uiSrc/components'
import InstancePageRouter from './InstancePageRouter'
import { RdiPipelineHeader } from './components'
import styles from './styles.module.scss'

export interface Props {
  routes: IRoute[]
}

const RdiInstancePage = ({ routes = [] }: Props) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { pathname } = useLocation()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { lastPage, contextRdiInstanceId } = useSelector(appContextSelector)
  const { data: rdiInstances } = useSelector(rdiInstancesSelector)
  const { data: dbInstances } = useSelector(dbInstancesSelector)

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
    <RiCol className={styles.page} gap="none" responsive={false}>
      <RiFlexItem>
        <RdiInstanceHeader />
      </RiFlexItem>
      <RiFlexItem grow={false}>
        <RdiPipelineHeader />
      </RiFlexItem>
      <RdiInstancePageTemplate>
        <InstancePageRouter routes={routes} />
      </RdiInstancePageTemplate>
    </RiCol>
  )
}

export default RdiInstancePage
