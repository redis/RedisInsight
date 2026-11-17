import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { Row } from 'uiSrc/components/base/layout/flex'
import BadgeIcon from '../badge-icon'
import { badgesContent } from '../constants'

export interface Props {
  badges?: string[]
}

const RecommendationBadges = ({ badges = [] }: Props) => {
  const { t } = useTranslation()

  return (
    <Row align="center" justify="end" gap="m">
      {badgesContent.map(
        ({ id, nameKey, icon }) =>
          badges.includes(id) && (
            <BadgeIcon key={id} id={id} icon={icon} name={t(nameKey)} />
          ),
      )}
    </Row>
  )
}

export default RecommendationBadges
