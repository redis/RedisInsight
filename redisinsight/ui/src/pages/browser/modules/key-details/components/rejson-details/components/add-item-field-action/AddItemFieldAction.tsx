import React from 'react'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { PlusIcon } from 'uiSrc/components/base/icons'
import { useTranslation } from 'uiSrc/i18n'
import { getBrackets } from '../../utils'
import styles from '../../styles.module.scss'

export interface Props {
  leftPadding: number
  type: string
  onClickSetKVPair: () => void
}

const AddItemFieldAction = ({ leftPadding, type, onClickSetKVPair }: Props) => {
  const { t } = useTranslation()
  return (
    <div className={styles.row} style={{ paddingLeft: `${leftPadding}em` }}>
      <span className={styles.defaultFont}>{getBrackets(type, 'end')}</span>
      <IconButton
        icon={PlusIcon}
        size="S"
        className={styles.jsonButtonStyle}
        onClick={onClickSetKVPair}
        aria-label={t('browser.rejson.addFieldAria')}
        data-testid="add-field-btn"
      />
    </div>
  )
}

export default AddItemFieldAction
