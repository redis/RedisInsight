import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  resetDatabaseContext,
  resetRdiContext,
  setAppContextConnectedRdiInstanceId,
  appContextSelector,
} from 'uiSrc/slices/app/context'
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
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { RdiPipelineWrapper } from 'uiSrc/packages/rdi-pipeline'

import styles from '../instance/styles.module.scss'

/**
 * Standalone page for the RDI Pipeline package.
 * This page replaces the standard RDI instance navigation with the package's own UI.
 *
 * URL: /integrate/:rdiInstanceId/pipeline
 */
const PipelinePocPage = () => {
  const dispatch = useDispatch()
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { contextRdiInstanceId } = useSelector(appContextSelector)
  const { data: rdiInstances } = useSelector(rdiInstancesSelector)
  const { data: dbInstances } = useSelector(dbInstancesSelector)

  // Fetch instances on mount
  useEffect(() => {
    if (!dbInstances?.length) {
      dispatch(fetchInstancesAction())
    }
    if (!rdiInstances?.length) {
      dispatch(fetchRdiInstancesAction())
    }
  }, [])

  // Set up RDI context when instance changes
  useEffect(() => {
    if (!contextRdiInstanceId || contextRdiInstanceId !== rdiInstanceId) {
      dispatch(resetRdiContext())
      dispatch(fetchConnectedInstanceAction(rdiInstanceId))
    }
    dispatch(setAppContextConnectedRdiInstanceId(rdiInstanceId))

    // Clear database context
    dispatch(resetConnectedDatabaseInstance())
    dispatch(resetDatabaseContext())
  }, [rdiInstanceId])

  return (
    <Col className={styles.page} gap="none" responsive={false}>
      <FlexItem>
        <RdiInstanceHeader />
      </FlexItem>
      {/* Package takes over - no AppNavigation or RdiPipelineHeader */}
      <RdiInstancePageTemplate>
        <RdiPipelineWrapper />
      </RdiInstancePageTemplate>
    </Col>
  )
}

export default PipelinePocPage
