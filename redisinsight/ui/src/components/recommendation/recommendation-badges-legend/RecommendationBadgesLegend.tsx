import React from 'react'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { badgesContent } from '../constants'
import styles from '../styles.module.scss'

const RecommendationBadgesLegend = () => (
  <RiRow
    data-testid="badges-legend"
    className={styles.badgesLegend}
    justify="end"
  >
    {badgesContent.map(({ id, icon, name }) => (
      <RiFlexItem key={id} className={styles.badge}>
        <div className={styles.badgeWrapper}>
          {icon}
          {name}
        </div>
      </RiFlexItem>
    ))}
  </RiRow>
)

export default RecommendationBadgesLegend
