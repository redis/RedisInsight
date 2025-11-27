import React from 'react'
import { Popover } from '@redis-ui/components'

import * as keys from 'uiSrc/constants/keys'
import { RiPopoverProps } from './types'
import { anchorPositionMap, panelPaddingSizeMap } from './config'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'

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
  persistent,
  customOutsideDetector,
  ...props
}: RiPopoverProps) => {
  const popoverContent =
    children && customOutsideDetector ? (
      <OutsideClickDetector
        onOutsideClick={(event) => closePopover?.(event as any)}
      >
        {children as JSX.Element}
      </OutsideClickDetector>
    ) : (
      children
    )

  return (
    <Popover
      {...props}
      open={isOpen}
      onClickOutside={customOutsideDetector ? undefined : closePopover}
      onKeyDown={(event) => {
        // Close on escape press
        if (event.key === keys.ESCAPE) {
          closePopover?.(event as any)
        }
      }}
      persistent={persistent}
      content={popoverContent}
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
}
