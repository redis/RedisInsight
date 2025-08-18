import React from 'react'
import cx from 'classnames'

import { RiPrimaryButton, RiSecondaryButton } from 'uiBase/forms'
import { RiText } from 'uiBase/text'
import { RiPopover } from 'uiBase/index'
import styles from '../../styles.module.scss'

interface ConfirmOverwriteProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  children: NonNullable<React.ReactNode>
}

const ConfirmOverwrite = ({
  isOpen,
  onCancel,
  onConfirm,
  children,
}: ConfirmOverwriteProps) => (
  <RiPopover
    ownFocus
    anchorPosition="downRight"
    isOpen={isOpen}
    closePopover={onCancel}
    panelClassName={cx('popoverLikeTooltip')}
    button={children}
  >
    <RiText size="m" style={{ fontWeight: 'bold' }}>
      Duplicate JSON key detected
    </RiText>
    <RiText size="s">
      You already have the same JSON key. If you proceed, a value of the
      existing JSON key will be overwritten.
    </RiText>

    <div className={styles.confirmDialogActions}>
      <RiSecondaryButton
        aria-label="Cancel"
        size="small"
        onClick={onCancel}
        data-testid="cancel-confirmation-btn"
      >
        Cancel
      </RiSecondaryButton>

      <RiPrimaryButton
        aria-label="Overwrite"
        size="small"
        onClick={onConfirm}
        data-testid="overwrite-btn"
      >
        Overwrite
      </RiPrimaryButton>
    </div>
  </RiPopover>
)

export default ConfirmOverwrite
