import React from 'react'
import { RiIconButton } from 'uiSrc/components/base/forms'
import { PlusIcon } from 'uiSrc/components/base/icons'
import { getBrackets } from '../../utils'
import styles from '../../styles.module.scss'

export interface Props {
  leftPadding: number
  type: string
  onClickSetKVPair: () => void
}

const AddItemFieldAction = ({ leftPadding, type, onClickSetKVPair }: Props) => (
  <div className={styles.row} style={{ paddingLeft: `${leftPadding}em` }}>
    <span className={styles.defaultFont}>{getBrackets(type, 'end')}</span>
    <RiIconButton
      icon={PlusIcon}
      size="S"
      className={styles.jsonButtonStyle}
      onClick={onClickSetKVPair}
      aria-label="Add field"
      data-testid="add-field-btn"
    />
  </div>
)

export default AddItemFieldAction
