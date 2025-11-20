import React from 'react'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiTooltip } from 'uiSrc/components/base'
import validationErrors from 'uiSrc/constants/validationErrors'

import { type SubmitButtonProps } from './SubmitButton.types'

export const SubmitButton = ({
  isDisabled,
  loading,
  onClick,
}: SubmitButtonProps) => (
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
      Show databases
    </PrimaryButton>
  </RiTooltip>
)

