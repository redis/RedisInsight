import React from 'react'

import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { formatLongName, setTitle } from 'uiSrc/utils'
import { useTranslation } from 'uiSrc/i18n'
import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'
import * as S from './PipelineManagementV2Page.styles'

const PipelineManagementV2Page = () => {
  const { t } = useTranslation()
  const { name: connectedRdiInstanceName } = useAppSelector(
    connectedInstanceSelector,
  )

  const rdiInstanceName = formatLongName(connectedRdiInstanceName, 33, 0, '...')
  setTitle(t('rdi.pipeline.pageTitle', { name: rdiInstanceName }))

  return (
    <Row
      justify="center"
      align="center"
      data-testid="pipeline-management-v2-page"
    >
      <S.PlaceholderContainer>
        <Text>The new pipeline management experience is coming soon.</Text>
      </S.PlaceholderContainer>
    </Row>
  )
}

export default PipelineManagementV2Page
