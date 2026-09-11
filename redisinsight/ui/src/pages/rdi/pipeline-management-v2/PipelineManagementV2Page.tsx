import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useAppDispatch } from 'uiSrc/slices/hooks'
import { formatLongName, setTitle } from 'uiSrc/utils'
import { useTranslation } from 'uiSrc/i18n'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { PageNames } from 'uiSrc/constants'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import { RdiInstanceHeader } from 'uiSrc/components'
import { RdiInstancePageTemplate } from 'uiSrc/templates'
import { useConnectRdiInstance } from '../hooks/useConnectRdiInstance'
import RdiPipeline from './components/rdi-pipeline'
import styles from './styles.module.scss'

/**
 * Standalone top-level page for the @rdi-ui/pipeline-backed management UI.
 *
 * A sibling of RdiInstancePage (the v1 shell), not a route nested inside it:
 * the package owns its own internal navigation, so this page skips the
 * v1-only chrome that would otherwise be sandwiched around it - AppNavigation's
 * Pipeline/Analytics tabs and RdiPipelineHeader's pipeline status bar, both
 * of which read v1's own pipeline REST API and have no relationship to the
 * package's UI.
 *
 * The RDI instance breadcrumb (RdiInstanceHeader) is kept for navigation
 * consistency with the rest of RedisInsight, and instance loading goes
 * through the same hook the v1 shell uses, so both behave identically.
 */
const PipelineManagementV2Page = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { connectedInstance } = useConnectRdiInstance(rdiInstanceId)

  const rdiInstanceName = formatLongName(connectedInstance.name, 33, 0, '...')
  setTitle(t('rdi.pipeline.pageTitle', { name: rdiInstanceName }))

  useEffect(
    () => () => {
      dispatch(setLastPageContext(PageNames.rdiPipelineManagement))
    },
    [],
  )

  return (
    <Col className={styles.page} gap="none" responsive={false}>
      <FlexItem>
        <RdiInstanceHeader />
      </FlexItem>
      <RdiInstancePageTemplate>
        <FlexItem grow data-testid="pipeline-management-v2-page">
          <RdiPipeline rdiInstanceId={rdiInstanceId} />
        </FlexItem>
      </RdiInstancePageTemplate>
    </Col>
  )
}

export default PipelineManagementV2Page
