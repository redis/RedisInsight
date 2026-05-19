import React from 'react'

import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

import { VEC2WORD_INFO, VEC2WORD_PREVIEW } from './data'
import * as S from './LoadSampleDataset.styles'

const LoadSampleDataset = () => (
  <S.Layout
    gap="xl"
    align="stretch"
    justify="around"
    data-testid="add-key-vector-set-load-sample-dataset"
  >
    <S.PreviewColumn gap="s" data-testid="load-sample-dataset-preview" grow>
      {VEC2WORD_PREVIEW.map((row) => (
        <Row
          key={row.word}
          gap="xs"
          data-testid={`load-sample-dataset-preview-${row.word}`}
          justify="between"
          align="center"
        >
          <S.PreviewRowText size="s" color="informative600" variant="semiBold">
            {row.word}
          </S.PreviewRowText>
          <S.PreviewRowText size="s" color="informative600" variant="semiBold">
            {row.vector}
          </S.PreviewRowText>
        </Row>
      ))}
    </S.PreviewColumn>

    <Col
      gap="xs"
      align="start"
      data-testid="load-sample-dataset-info"
      grow={false}
    >
      {VEC2WORD_INFO.map((row) => (
        <S.InfoRow
          key={row.label}
          gap="m"
          align="center"
          data-testid={`load-sample-dataset-info-${row.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Text size="S" color="secondary">
            {row.label}:
          </Text>
          <Text size="S" color="primary">
            {row.value}
          </Text>
        </S.InfoRow>
      ))}
    </Col>
  </S.Layout>
)

export default LoadSampleDataset
