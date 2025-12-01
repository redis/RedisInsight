import React, { useEffect, useState } from 'react'

import { handleCopy as handleCopyUtil } from 'uiSrc/utils'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { StyledCopiedBadge } from './CopyButton.styles'
import { CopyButtonProps } from './CopyButton.types'

export const CopyButton = ({
  onCopy,
  id,
  tooltipClassName,
  copy = '',
  content = 'Copy',
  successLabel = 'Copied',
  fadeOutDuration = 2500,
  resetDuration = 2000,
  'data-testid': dataTestId = 'copy-button',
  'aria-label': ariaLabel,
}: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false)

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

  return (
    <Row align="center">
      {!isCopied && (
        <RiTooltip
          position="right"
          content={content}
          anchorClassName={tooltipClassName}
        >
          <IconButton
            icon={CopyIcon}
            id={id}
            aria-label={ariaLabel || content}
            onClick={handleCopyClick}
            data-testid={`${dataTestId}-btn`}
          />
        </RiTooltip>
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
