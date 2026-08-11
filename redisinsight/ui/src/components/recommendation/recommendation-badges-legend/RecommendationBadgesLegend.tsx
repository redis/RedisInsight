import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { badgesContent } from '../constants'
import styles from '../styles.module.scss'

const RecommendationBadgesLegend = () => {
  const { t } = useTranslation()

  return (
    <Row
      data-testid="badges-legend"
      className={styles.badgesLegend}
      justify="end"
    >
      {badgesContent.map(({ id, icon, nameKey }) => (
        <FlexItem key={id} className={styles.badge}>
          <div className={styles.badgeWrapper}>
            {icon}
            {t(nameKey)}
          </div>
        </FlexItem>
      ))}
    </Row>
  )
}

export default RecommendationBadgesLegend
