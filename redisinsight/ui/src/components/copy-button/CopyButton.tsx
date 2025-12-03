import React, { useEffect, useState } from 'react'

import { handleCopy as handleCopyUtil } from 'uiSrc/utils'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'

import { ButtonWithTooltip } from './components'
import { StyledCopiedBadge, StyledTooltipContainer } from './CopyButton.styles'
import { CopyButtonProps } from './CopyButton.types'

const DEFAULT_TOOLTIP_CONTENT = 'Copy'

export const CopyButton = ({
  onCopy,
  id,
  copy = '',
  successLabel = 'Copied',
  fadeOutDuration = 2500,
  resetDuration = 2500,
  'data-testid': dataTestId = 'copy-button',
  'aria-label': ariaLabel,
  withTooltip = true,
  tooltipConfig,
  className,
  disabled = false,
}: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false)

  const buttonAriaLabel = ariaLabel ?? DEFAULT_TOOLTIP_CONTENT

  useEffect(() => {
    if (!isCopied) {
      return
    }
    const timeout = setTimeout(() => {
      setIsCopied(false)
    }, resetDuration)

    return () => clearTimeout(timeout)
  }, [isCopied, resetDuration])

  const handleCopyClick = async (event: React.MouseEvent) => {
    event.stopPropagation()

    handleCopyUtil(copy)

    setIsCopied(true)

    if (onCopy) {
      await onCopy(event)
    }
  }

  const button = (
    <IconButton
      icon={CopyIcon}
      id={id}
      aria-label={buttonAriaLabel}
      onClick={handleCopyClick}
      disabled={disabled}
      data-testid={`${dataTestId}-btn`}
    />
  )

  return (
    <StyledTooltipContainer
      grow={false}
      align="center"
      className={className}
      justify="center"
    >
      {!isCopied && (
        <ButtonWithTooltip
          button={button}
          withTooltip={withTooltip}
          tooltipConfig={tooltipConfig}
        />
      )}
      {isCopied && (
        <StyledCopiedBadge
          label={successLabel}
          withIcon
          variant="success"
          $fadeOutDuration={fadeOutDuration}
          $isEmpty={!successLabel}
          data-testid={`${dataTestId}-badge`}
        />
      )}
    </StyledTooltipContainer>
  )
}
