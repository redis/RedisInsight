import React from 'react'

import { Col } from 'uiSrc/components/base/layout/flex'
import { Title } from 'uiSrc/components/base/text'

import { GeoMetricProps } from './GeoMetric.types'
import * as S from './GeoMetric.styles'

export const GeoMetric = ({ label, value }: GeoMetricProps) => (
  <S.Panel>
    <Col gap="xs">
      <S.Label size="XS" color="subdued">
        {label}
      </S.Label>
      <Title size="L">{value}</Title>
    </Col>
  </S.Panel>
)
