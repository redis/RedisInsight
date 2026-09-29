import React, { useEffect } from 'react'
import { Redirect, useParams } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { formatLongName, setTitle } from 'uiSrc/utils'
import { useTranslation } from 'uiSrc/i18n'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { PageNames, Pages } from 'uiSrc/constants'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'
import { RdiInstanceHeader } from 'uiSrc/components'
import { ExplorePanelTemplate } from 'uiSrc/templates'
import { Loader } from 'uiSrc/components/base/display'
import { useRdiPipelineUi } from '../hooks/useRdiPipelineUi'
import RdiPipeline from './components/rdi-pipeline'
import * as S from './PipelineManagementV2Page.styles'

const PipelineManagementV2Page = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  // useRdiPipelineUi already connects the instance (fetch + context reset) -
  // this is a plain read of the same state, not a second connection.
  const connectedInstance = useAppSelector(connectedInstanceSelector)
  const rdiPipelineUi = useRdiPipelineUi(rdiInstanceId)

  const rdiInstanceName = formatLongName(connectedInstance.name, 33, 0, '...')
  setTitle(t('rdi.pipeline.pageTitle', { name: rdiInstanceName }))

  useEffect(
    () => () => {
      dispatch(setLastPageContext(PageNames.rdiPipelineManagementV2))
    },
    [],
  )

  if (rdiPipelineUi.status === 'loading') {
    return (
      <Row justify="center" align="center">
        <Loader />
      </Row>
    )
  }

  // The route itself is only gated by FeatureFlags.rdi, so a direct/
  // bookmarked visit to this URL would otherwise skip the flag+version
  // check that InstancePage's own v1->v2 redirect decision already applies.
  if (rdiPipelineUi.target === 'v1') {
    return <Redirect to={Pages.rdiPipelineManagement(rdiInstanceId)} />
  }

  return (
    <S.PageContainer gap="none" responsive={false}>
      <FlexItem>
        <RdiInstanceHeader />
      </FlexItem>
      <FlexItem grow data-testid="pipeline-management-v2-page">
        <ExplorePanelTemplate>
          <RdiPipeline rdiInstanceId={rdiInstanceId} />
        </ExplorePanelTemplate>
      </FlexItem>
    </S.PageContainer>
  )
}

export default PipelineManagementV2Page
