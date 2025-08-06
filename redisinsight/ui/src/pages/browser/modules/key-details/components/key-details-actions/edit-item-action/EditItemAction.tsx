import React from 'react'
import { RiIconButton } from 'uiBase/forms'
import { EditIcon } from 'uiBase/icons'
import { Nullable } from 'uiSrc/utils'

import { RiTooltip } from 'uiSrc/components'
import styles from '../styles.module.scss'

export interface Props {
  title: string
  isEditable: boolean
  tooltipContent: Nullable<string>
  onEditItem: () => void
}

const EditItemAction = ({
  title,
  isEditable,
  tooltipContent,
  onEditItem,
}: Props) => (
  <div className={styles.actionBtn}>
    <RiTooltip content={tooltipContent} data-testid="edit-key-value-tooltip">
      <RiIconButton
        disabled={!isEditable}
        icon={EditIcon}
        aria-label={title}
        onClick={onEditItem}
        data-testid="edit-key-value-btn"
      />
    </RiTooltip>
  </div>
)

export { EditItemAction }
