import React from 'react'

import { RiTooltip } from 'uiSrc/components/base/tooltip'

import { ButtonWithTooltipProps } from './ButtonWithTooltip.types'

const DEFAULT_TOOLTIP_CONTENT = 'Copy'

export const ButtonWithTooltip = ({
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
