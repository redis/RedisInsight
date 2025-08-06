import React from 'react'

import { RiIconButton } from 'uiBase/forms'
import { MinusInCircleIcon } from 'uiBase/icons'
import { RiTooltip } from 'uiSrc/components'
import styles from '../styles.module.scss'

export interface Props {
  title: string
  openRemoveItemPanel: () => void
}

const RemoveItemsAction = ({ title, openRemoveItemPanel }: Props) => (
  <RiTooltip content={title} position="left" anchorClassName={styles.actionBtn}>
    <RiIconButton
      icon={MinusInCircleIcon}
      aria-label={title}
      onClick={openRemoveItemPanel}
      data-testid="remove-key-value-items-btn"
    />
  </RiTooltip>
)

export { RemoveItemsAction }
