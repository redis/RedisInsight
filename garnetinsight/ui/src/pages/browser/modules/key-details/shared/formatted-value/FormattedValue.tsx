import { ToolTipPositions } from '@elastic/eui'
import React from 'react'
import { RiTooltip, RiTooltipProps } from 'uiSrc/components'

export interface Props
  extends Omit<RiTooltipProps, 'children' | 'delay' | 'position'> {
  value: string | JSX.Element
  tooltipContent: string | JSX.Element
  expanded?: boolean
  title?: string
  truncateLength?: number
  position?: ToolTipPositions
}

const FormattedValue = ({
  expanded,
  value,
  title,
  tooltipContent,
  truncateLength = 200,
  position = 'bottom',
  ...rest
}: Props) => {
  if (expanded) return <>{value}</>

  const truncated = value?.substring?.(0, truncateLength) ?? value

  return (
    <RiTooltip
      title={title}
      content={tooltipContent}
      anchorClassName="truncateText"
      position={position}
      {...rest}
    >
      <>{truncated}</>
    </RiTooltip>
  )
}

export default FormattedValue
