import React from 'react'

import { RiRow } from 'uiBase/layout'
import BadgeIcon from '../badge-icon'
import { badgesContent } from '../constants'

export interface Props {
  badges?: string[]
}

const RecommendationBadges = ({ badges = [] }: Props) => (
  <RiRow align="center" justify="end" gap="m">
    {badgesContent.map(
      ({ id, name, icon }) =>
        badges.includes(id) && (
          <BadgeIcon key={id} id={id} icon={icon} name={name} />
        ),
    )}
  </RiRow>
)

export default RecommendationBadges
