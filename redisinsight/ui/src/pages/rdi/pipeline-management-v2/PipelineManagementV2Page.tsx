import React, { useEffect } from 'react'

import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'
import { useAppSelector, useAppDispatch } from 'uiSrc/slices/hooks'
import { formatLongName, setTitle } from 'uiSrc/utils'
import { useTranslation } from 'uiSrc/i18n'
import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'
import { PageNames } from 'uiSrc/constants'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import * as S from './PipelineManagementV2Page.styles'

const PipelineManagementV2Page = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { name: connectedRdiInstanceName } = useAppSelector(
    connectedInstanceSelector,
  )

  const rdiInstanceName = formatLongName(connectedRdiInstanceName, 33, 0, '...')
  setTitle(t('rdi.pipeline.pageTitle', { name: rdiInstanceName }))

  useEffect(
    () => () => {
      // unmount - record this as the last visited RDI section, same as the
      // legacy pipeline management page, so re-entering the instance's bare
      // URL restores here instead of wherever lastPage was last set to
      dispatch(setLastPageContext(PageNames.rdiPipelineManagement))
    },
    [],
  )

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
