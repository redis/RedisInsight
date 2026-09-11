import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'
import { useAppSelector, useAppDispatch } from 'uiSrc/slices/hooks'
import { formatLongName, setTitle } from 'uiSrc/utils'
import { useTranslation } from 'uiSrc/i18n'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { PageNames } from 'uiSrc/constants'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import RdiPipeline from './components/rdi-pipeline'

const PipelineManagementV2Page = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { name: connectedRdiInstanceName } = useAppSelector(
    connectedInstanceSelector,
  )

  const rdiInstanceName = formatLongName(connectedRdiInstanceName, 33, 0, '...')
  setTitle(t('rdi.pipeline.pageTitle', { name: rdiInstanceName }))

  useEffect(
    () => () => {
      dispatch(setLastPageContext(PageNames.rdiPipelineManagement))
    },
    [],
  )

  return (
    <FlexItem grow data-testid="pipeline-management-v2-page">
      <RdiPipeline rdiInstanceId={rdiInstanceId} />
    </FlexItem>
  )
}

export default PipelineManagementV2Page
