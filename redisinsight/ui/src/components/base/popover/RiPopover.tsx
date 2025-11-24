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
  standalone = false,
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
  // If standalone is true, the trigger will be standalone and will not be wrapped in a span
  // for this to work properly, ether base trigger element is `div`, `span` etc. (base dom element)
  // or a component that forwards ref
  const triggerElement = standalone ? (
    activeTrigger
  ) : (
    <span className={anchorClassName}>{activeTrigger}</span>
  )

  const placement =
    anchorPosition && anchorPositionMap[anchorPosition]?.placement
  const align = anchorPosition && anchorPositionMap[anchorPosition]?.align
  // TODO: maybe use wrapped popover instead of inline style?!
  const padding = panelPaddingSize && panelPaddingSizeMap[panelPaddingSize]
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
        padding,
      }}
      autoFocus={ownFocus}
      placement={placement}
      align={align}
    >
      {triggerElement}
    </Popover>
  )
}
