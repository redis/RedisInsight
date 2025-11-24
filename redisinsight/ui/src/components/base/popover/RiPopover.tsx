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
  trigger,
  anchorPosition,
  panelPaddingSize,
  anchorClassName,
  panelClassName,
  className,
  maxWidth = '100%',
  ...props
}: RiPopoverProps) => {
  // Warn if both button and trigger are provided
  if (button !== undefined && trigger !== undefined) {
    console.warn(
      "RiPopover: Both 'button' and 'trigger' props are provided. Using 'trigger'. Please migrate to 'trigger' prop.",
    )
  }

  // Warn if both panelClassName and className are provided
  if (panelClassName !== undefined && className !== undefined) {
    console.warn(
      "RiPopover: Both 'panelClassName' and 'className' props are provided. Using 'className'. Please migrate to 'className' prop.",
    )
  }

  // Determine which trigger to use
  const activeTrigger = trigger ?? button

  // Determine which className to use
  const activeClassName = className ?? panelClassName

  // Render trigger element
  // For new API (trigger): React elements render directly, scalars wrap in span
  // For old API (button): Always wrap in span (backwards compatibility)
  const triggerElement =
    trigger !== undefined && React.isValidElement(activeTrigger) ? (
      activeTrigger
    ) : (
      <span className={anchorClassName}>{activeTrigger}</span>
    )

  return (
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
      className={activeClassName}
      maxWidth={maxWidth}
      style={{
        padding: panelPaddingSize && panelPaddingSizeMap[panelPaddingSize],
      }}
      autoFocus={ownFocus}
      placement={anchorPosition && anchorPositionMap[anchorPosition]?.placement}
      align={anchorPosition && anchorPositionMap[anchorPosition]?.align}
    >
      {triggerElement}
    </Popover>
  )
}
