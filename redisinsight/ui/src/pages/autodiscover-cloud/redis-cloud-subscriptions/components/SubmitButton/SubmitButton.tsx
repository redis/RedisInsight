import React from 'react'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiTooltip } from 'uiSrc/components/base'
import validationErrors from 'uiSrc/constants/validationErrors'
import { useTranslation } from 'uiSrc/i18n'

import { type SubmitButtonProps } from './SubmitButton.types'

export const SubmitButton = ({
  isDisabled,
  loading,
  onClick,
}: SubmitButtonProps) => {
  const { t } = useTranslation()

  return (
    <RiTooltip
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      title={
        isDisabled ? validationErrors.SELECT_AT_LEAST_ONE('subscription') : null
      }
      content={
        isDisabled ? (
          <span>{validationErrors.NO_SUBSCRIPTIONS_CLOUD}</span>
        ) : null
      }
    >
      <PrimaryButton
        size="m"
        disabled={isDisabled}
        onClick={onClick}
        loading={loading}
        data-testid="btn-show-databases"
      >
        {t('autodiscover.cloud.subscriptions.showDatabases')}
      </PrimaryButton>
    </RiTooltip>
  )
}
