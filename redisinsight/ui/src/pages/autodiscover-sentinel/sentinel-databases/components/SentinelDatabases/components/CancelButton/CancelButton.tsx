import React from 'react'
import {
  SecondaryButton,
  DestructiveButton,
} from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
import { useTranslation } from 'uiSrc/i18n'

import { type CancelButtonProps } from './CancelButton.types'
import styles from './styles.module.scss'

export const CancelButton = ({
  isPopoverOpen,
  onClose,
  onShowPopover,
  onClosePopover,
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
          data-testid="btn-cancel"
        >
          {t('autodiscover.sentinel.cancel.button')}
        </SecondaryButton>
      }
    >
      <Text size="S">{t('autodiscover.sentinel.cancel.confirm')}</Text>
      <br />
      <div>
        <DestructiveButton
          size="s"
          onClick={onClose}
          data-testid="btn-cancel-proceed"
        >
          {t('autodiscover.sentinel.cancel.proceed')}
        </DestructiveButton>
      </div>
    </RiPopover>
  )
}
