import React, { useEffect, useState } from 'react'

import { handleCopy as handleCopyUtil } from 'uiSrc/utils'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { StyledCopiedBadge } from './CopyButton.styles'
import { CopyButtonProps } from './CopyButton.types'

const DEFAULT_TOOLTIP_CONTENT = "Copy"

const ButtonWithTooltip = ({
  button,
  withTooltip,
  tooltipConfig,
}: {
  button: React.ReactNode
  withTooltip: boolean
  tooltipConfig: CopyButtonProps["tooltipConfig"]
}) => {
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
    copy = "",
    successLabel = "Copied",
    fadeOutDuration = 2500,
    resetDuration = 2500,
    "data-testid": dataTestId = "copy-button",
    "aria-label": ariaLabel,
    withTooltip = true,
    tooltipConfig,
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
      <Row align="center">
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
            data-testid={`${dataTestId}-badge`}
          />
        )}
      </Row>
    )
  }
