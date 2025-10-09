import React from 'react'
import { Popover } from '@redis-ui/components'

import * as keys from 'uiSrc/constants/keys'
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
    onKeyDown={(event) => {
      // Close on escape press
      if (event.key === keys.ESCAPE) {
        closePopover?.(event as any)
      }
    }}
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
