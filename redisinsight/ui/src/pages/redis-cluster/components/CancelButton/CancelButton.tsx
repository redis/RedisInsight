import React from 'react'

import { RiPopover } from 'uiSrc/components/base'
import {
  DestructiveButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { useTranslation } from 'uiSrc/i18n'
import styles from './CancelButton.style'

import type { CancelButtonProps } from './CancelButton.types'

export const CancelButton = ({
  isPopoverOpen,
  onShowPopover,
  onClosePopover,
  onProceed,
}: CancelButtonProps) => {
  const { t } = useTranslation()

  return (
    <RiPopover
      anchorPosition="upCenter"
      isOpen={isPopoverOpen}
      closePopover={onClosePopover}
      panelClassName={styles.panelCancelBtn}
      panelPaddingSize="l"
      button={
        <SecondaryButton
          onClick={onShowPopover}
          className="btn-cancel"
          data-testid="btn-back"
        >
          {t('cluster.cancel.button')}
        </SecondaryButton>
      }
    >
      <Text size="m">{t('cluster.cancel.confirm')}</Text>
      <br />
      <div>
        <DestructiveButton
          size="s"
          onClick={onProceed}
          data-testid="btn-back-proceed"
        >
          {t('cluster.cancel.proceed')}
        </DestructiveButton>
      </div>
    </RiPopover>
  )
}
