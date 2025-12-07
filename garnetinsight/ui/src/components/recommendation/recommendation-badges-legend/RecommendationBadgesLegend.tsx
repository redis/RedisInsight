import React from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { badgesContent } from '../constants'
import styles from '../styles.module.scss'

const RecommendationBadgesLegend = () => (
  <Row
    data-testid="badges-legend"
    className={styles.badgesLegend}
    justify="end"
  >
    {badgesContent.map(({ id, icon, name }) => (
      <FlexItem key={id} className={styles.badge}>
        <div className={styles.badgeWrapper}>
          {icon}
          {name}
        </div>
      </FlexItem>
    ))}
  </Row>
)

export default RecommendationBadgesLegend
