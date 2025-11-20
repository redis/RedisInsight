import React from 'react'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { RiTooltip } from 'uiSrc/components'
import { ApiStatusCode } from 'uiSrc/constants'
import { ApiEncryptionErrors } from 'uiSrc/constants/apiErrors'
import validationErrors from 'uiSrc/constants/validationErrors'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { InfoIcon } from 'uiSrc/components/base/icons'

import type { AddErrorButtonProps } from './AddErrorButton.types'

export const AddErrorButton = ({
  name,
  error,
  alias,
  loading = false,
  onAddInstance = () => {},
}: AddErrorButtonProps) => {
  const isDisabled = !alias
  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    error?.statusCode !== ApiStatusCode.Unauthorized &&
    !ApiEncryptionErrors.includes(error?.name || '') &&
    error?.statusCode !== ApiStatusCode.BadRequest
  ) {
    return null
  }
  return (
    <FlexItem padding role="presentation">
      <RiTooltip
        position="top"
        title={isDisabled ? validationErrors.REQUIRED_TITLE(1) : null}
        content={isDisabled ? <span>Database Alias</span> : null}
      >
        <PrimaryButton
          size="s"
          disabled={isDisabled}
          loading={loading}
          onClick={() => onAddInstance(name)}
          icon={isDisabled ? InfoIcon : undefined}
        >
          Add Primary Group
        </PrimaryButton>
      </RiTooltip>
    </FlexItem>
  )
}
