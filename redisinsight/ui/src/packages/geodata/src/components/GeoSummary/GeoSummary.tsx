import React from 'react'

import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

import { GeoSummaryProps } from './GeoSummary.types'
import * as S from './GeoSummary.styles'

export const GeoSummary = ({ ariaLabel, items }: GeoSummaryProps) => (
  <S.Panel aria-label={ariaLabel}>
    <Row gap="l" wrap>
      {items.map(({ label, value }) => (
        <S.Item key={label} gap="xs">
          <S.Label size="XS" color="subdued">
            {label}
          </S.Label>
          <Text size="S" variant="semiBold">
            {value}
          </Text>
        </S.Item>
      ))}
    </Row>
  </S.Panel>
)
