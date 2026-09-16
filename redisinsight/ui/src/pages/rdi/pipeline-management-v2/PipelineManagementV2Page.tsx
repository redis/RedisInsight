import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useAppDispatch } from 'uiSrc/slices/hooks'
import { formatLongName, setTitle } from 'uiSrc/utils'
import { useTranslation } from 'uiSrc/i18n'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { PageNames } from 'uiSrc/constants'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import { RdiInstanceHeader } from 'uiSrc/components'
import { ExplorePanelTemplate } from 'uiSrc/templates'
import { useConnectRdiInstance } from '../hooks/useConnectRdiInstance'
import RdiPipeline from './components/rdi-pipeline'
import * as S from './PipelineManagementV2Page.styles'

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
