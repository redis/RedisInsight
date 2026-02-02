import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import * as S from '../Recommendation.styles'

export interface Props {
  id: string
  icon: React.ReactElement
  name: string
}
const BadgeIcon = ({ id, icon, name }: Props) => (
  <S.Badge as={FlexItem} key={id} data-testid={`recommendation-badge-${id}`}>
    <S.BadgeWrapper data-testid={id}>
      <RiTooltip content={name} position="top" anchorClassName="flex-row">
        {icon}
      </RiTooltip>
    </S.BadgeWrapper>
  </S.Badge>
)

export default BadgeIcon
