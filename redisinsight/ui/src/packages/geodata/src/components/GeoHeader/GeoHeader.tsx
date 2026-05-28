import React from 'react'

import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text, Title } from 'uiSrc/components/base/text'

import { GeoHeaderProps } from './GeoHeader.types'
import * as S from './GeoHeader.styles'

export const GeoHeader = ({ title, status, resultCount }: GeoHeaderProps) => (
  <S.Header justify="between" align="start" gap="l">
    <Title size="L">{title}</Title>
    <Row aria-label="Result summary" gap="l" grow={false}>
      <Col gap="xs" align="end">
        <S.Label size="XS" color="subdued">
          Status
        </S.Label>
        <Text size="S" variant="semiBold">
          {status || 'unknown'}
        </Text>
      </Col>
      {resultCount !== undefined && (
        <Col gap="xs" align="end">
          <S.Label size="XS" color="subdued">
            Results
          </S.Label>
          <Text size="S" variant="semiBold">
            {resultCount}
          </Text>
        </Col>
      )}
    </Row>
  </S.Header>
)
