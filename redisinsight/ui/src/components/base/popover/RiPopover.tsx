import React from 'react'
import { Popover } from '@redis-ui/components'

import { RiPopoverProps } from './types'
import { anchorPositionMap, panelPaddingSizeMap } from './config'

export const RiPopover = ({
  isOpen,
  closePopover,
  children,
  ownFocus,
  button,
  anchorPosition,
  panelPaddingSize,
  anchorClassName,
  panelClassName,
  maxWidth = '100%',
  ...props
}: RiPopoverProps) => (
  <Popover
    {...props}
    open={isOpen}
    onClickOutside={closePopover}
    content={children}
    // Props passed to the children wrapper:
    className={panelClassName}
    maxWidth={maxWidth}
    style={{
      padding: panelPaddingSize && panelPaddingSizeMap[panelPaddingSize],
    }}
    autoFocus={ownFocus}
    placement={anchorPosition && anchorPositionMap[anchorPosition]?.placement}
    align={anchorPosition && anchorPositionMap[anchorPosition]?.align}
  >
    <span className={anchorClassName}>{button}</span>
  </Popover>
)
