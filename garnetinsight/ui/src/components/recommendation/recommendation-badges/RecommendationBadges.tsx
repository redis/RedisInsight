import React from 'react'

import { Row } from 'uiSrc/components/base/layout/flex'
import BadgeIcon from '../badge-icon'
import { badgesContent } from '../constants'

export interface Props {
  badges?: string[]
}

const RecommendationBadges = ({ badges = [] }: Props) => (
  <Row align="center" justify="end" gap="m">
    {badgesContent.map(
      ({ id, name, icon }) =>
        badges.includes(id) && (
          <BadgeIcon key={id} id={id} icon={icon} name={name} />
        ),
    )}
  </Row>
)

export default RecommendationBadges
