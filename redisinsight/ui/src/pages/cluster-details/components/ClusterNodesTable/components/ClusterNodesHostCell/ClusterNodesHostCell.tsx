import React from 'react'

import { rgb } from 'uiSrc/utils/colors'
import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'
import { ClusterNodesTableCell } from 'uiSrc/pages/cluster-details/components/ClusterNodesTable/ClusterNodesTable.types'

import * as S from './ClusterNodesHostCell.styles'

export const ClusterNodesHostCell: ClusterNodesTableCell = ({
  row: {
    original: { letter, port, color, host },
  },
}) => (
  <>
    <S.LineIndicator
      data-testid={`node-color-${letter}`}
      $backgroundColor={rgb(color)}
    />
    <Row justify="between">
      <Text variant="semiBold" data-testid="node-letter">
        {letter}
      </Text>
      <Text variant="regular">
        {host}:{port}
      </Text>
    </Row>
  </>
)
