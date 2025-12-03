import React, { useEffect, useState } from 'react'

import { handleCopy as handleCopyUtil } from 'uiSrc/utils'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components/base/tooltip'
import { StyledCopiedBadge, StyledTooltipContainer } from './CopyButton.styles'
import { CopyButtonProps } from './CopyButton.types'

const DEFAULT_TOOLTIP_CONTENT = 'Copy'

interface ButtonWithTooltipProps {
  button: React.ReactNode
  withTooltip: boolean
  tooltipConfig: CopyButtonProps['tooltipConfig']
}

const ButtonWithTooltip = ({
  button,
  withTooltip,
  tooltipConfig,
}: ButtonWithTooltipProps) => {
  if (withTooltip) {
    return (
      <RiTooltip
        position="right"
        content={DEFAULT_TOOLTIP_CONTENT}
        {...tooltipConfig}
      >
        {button}
      </RiTooltip>
    )
  }

  return <>{button}</>
}
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
      data-testid={`${dataTestId}-btn`}
    />
  )

  return (
    <StyledTooltipContainer
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
