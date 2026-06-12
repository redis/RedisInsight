import React from 'react'

import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

import { SAMPLE_DATASETS } from './data'
import { DATASET_OPTIONS, getDatasetInfo } from './LoadSampleDataset.constants'
import { Props } from './LoadSampleDataset.types'
import * as S from './LoadSampleDataset.styles'

// Presentational preview only; the bulk-import load lives in the parent's Add
// Key action. Full data lives in backend data files, so this shows just the
// first rows.
const LoadSampleDataset = ({ dataset, onDatasetChange }: Props) => {
  const remaining = dataset.elementCount - dataset.previewRows.length

  return (
    <Col gap="l" data-testid="add-key-array-load-sample-dataset">
      <RiSelect
        value={dataset.collectionName}
        options={DATASET_OPTIONS}
        onChange={(value) => {
          const next = SAMPLE_DATASETS.find(
            ({ collectionName }) => collectionName === value,
          )
          if (next) {
            onDatasetChange(next)
          }
        }}
        data-testid="sample-dataset-select"
      />
      <Row gap="xl" align="center">
        <S.PreviewColumn gap="s" data-testid="load-sample-dataset-preview" grow>
          {dataset.previewRows.map((row) => (
            <Row
              key={row.index}
              gap="m"
              data-testid={`load-sample-dataset-preview-${row.index}`}
              align="baseline"
            >
              <S.PreviewIndexText
                size="xs"
                color="informative600"
                variant="semiBold"
              >
                {row.index}
              </S.PreviewIndexText>
              <S.PreviewRowText
                size="xs"
                color="informative600"
                variant="semiBold"
              >
                {row.value}
              </S.PreviewRowText>
            </Row>
          ))}
          {remaining > 0 && (
            <Text
              size="XS"
              color="secondary"
              data-testid="load-sample-dataset-preview-more"
            >
              … and {remaining} more
            </Text>
          )}
        </S.PreviewColumn>

        <Col
          gap="s"
          align="start"
          justify="start"
          data-testid="load-sample-dataset-info"
          grow={false}
        >
          {getDatasetInfo(dataset).map((row) => (
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
      </Row>
    </Col>
  )
}

export default LoadSampleDataset
