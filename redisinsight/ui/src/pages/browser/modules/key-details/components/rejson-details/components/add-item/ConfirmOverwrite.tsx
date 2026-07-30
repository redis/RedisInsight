import React from 'react'
import cx from 'classnames'

import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout'
import { useTranslation } from 'uiSrc/i18n'

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
}: ConfirmOverwriteProps) => {
  const { t } = useTranslation()
  return (
    <RiPopover
      ownFocus
      anchorPosition="downRight"
      isOpen={isOpen}
      closePopover={onCancel}
      panelClassName={cx('popoverLikeTooltip')}
      button={children}
    >
      <Text size="m" style={{ fontWeight: 'bold' }}>
        {t('browser.rejson.overwrite.title')}
      </Text>
      <Text size="s">{t('browser.rejson.overwrite.message')}</Text>
      <Spacer size="l" />
      <Row justify="end" gap="m">
        <SecondaryButton
          aria-label={t('browser.rejson.overwrite.cancel')}
          size="small"
          onClick={onCancel}
          data-testid="cancel-confirmation-btn"
        >
          {t('browser.rejson.overwrite.cancel')}
        </SecondaryButton>

        <PrimaryButton
          aria-label={t('browser.rejson.overwrite.confirm')}
          size="small"
          onClick={onConfirm}
          data-testid="overwrite-btn"
        >
          {t('browser.rejson.overwrite.confirm')}
        </PrimaryButton>
      </Row>
    </RiPopover>
  )
}

export default ConfirmOverwrite
