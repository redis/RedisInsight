import React from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { badgesContent } from '../constants'
import * as S from '../Recommendation.styles'

const RecommendationBadgesLegend = () => (
  <S.BadgesLegend as={Row} data-testid="badges-legend" justify="end">
    {badgesContent.map(({ id, icon, name }) => (
      <S.Badge as={FlexItem} key={id}>
        <S.BadgeWrapper>
          {icon}
          {name}
        </S.BadgeWrapper>
      </S.Badge>
    ))}
  </S.BadgesLegend>
)

export default RecommendationBadgesLegend
