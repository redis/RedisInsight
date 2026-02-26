import React from 'react'
import { useParams } from 'react-router-dom'

import { Text } from 'uiSrc/components/base/text'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelIcon } from 'uiSrc/components/base/icons'

import { useIndexInfo } from '../../hooks'
import { IndexInfo } from '../index-info'

import { IndexInfoSidePanelProps } from './IndexInfoSidePanel.types'
import * as S from './IndexInfoSidePanel.styles'

export const IndexInfoSidePanel = ({
  onClose,
  indexName: indexNameProp,
}: IndexInfoSidePanelProps) => {
  const { indexName: indexNameParam } = useParams<{ indexName?: string }>()
  const resolvedName = indexNameProp ?? decodeURIComponent(indexNameParam ?? '')

  const { indexInfo } = useIndexInfo({
    indexName: resolvedName,
  })

  return (
    <S.Panel data-testid="view-index-panel">
      <S.PanelHeader>
        <Text size="L" color="primary">
          View index
        </Text>
        <IconButton
          icon={CancelIcon}
          aria-label="Close panel"
          onClick={onClose}
          data-testid="close-index-panel-btn"
        />
      </S.PanelHeader>
      <S.PanelBody>
        <IndexInfo
          indexInfo={indexInfo ?? undefined}
          dataTestId="view-index-info"
        />
      </S.PanelBody>
    </S.Panel>
  )
}
