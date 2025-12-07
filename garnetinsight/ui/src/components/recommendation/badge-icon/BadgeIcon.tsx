import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import styles from '../styles.module.scss'

export interface Props {
  id: string
  icon: React.ReactElement
  name: string
}
const BadgeIcon = ({ id, icon, name }: Props) => (
  <FlexItem
    key={id}
    className={styles.badge}
    data-testid={`recommendation-badge-${id}`}
  >
    <div data-testid={id} className={styles.badgeWrapper}>
      <RiTooltip content={name} position="top" anchorClassName="flex-row">
        {icon}
      </RiTooltip>
    </div>
  </FlexItem>
)

export default BadgeIcon
