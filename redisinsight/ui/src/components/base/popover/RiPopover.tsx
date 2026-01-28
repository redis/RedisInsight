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
  trigger,
  anchorPosition,
  panelPaddingSize,
  anchorClassName,
  panelClassName,
  className,
  maxWidth = '100%',
  standalone = false,
  persistent,
  customOutsideDetector,
  ...props
}: RiPopoverProps) => {
  // Warn if both button and trigger are provided
  if (button !== undefined && trigger !== undefined) {
    console.warn(
      "[RiPopover]: Both 'button' and 'trigger' props are provided. Using 'trigger'. Please migrate to 'trigger' prop.",
    )
  }

  // Warn if both panelClassName and className are provided
  if (panelClassName !== undefined && className !== undefined) {
    console.warn(
      "[RiPopover]: Both 'panelClassName' and 'className' props are provided. Using 'className'. Please migrate to 'className' prop.",
    )
  }

  // Determine which trigger to use
  const activeTrigger = trigger ?? button

  // Determine which className to use
  const activeClassName = className ?? panelClassName

  // Render trigger element
  // If standalone is true, the trigger will be standalone and will not be wrapped in a span
  // for this to work properly, either base trigger element is `div`, `span` etc. (base dom element)
  // or a component that forwards ref
  // However, if standalone is true and trigger is a scalar (string, number, etc.),
  // we need to wrap it in a span because RadixPopover.Trigger with asChild requires a React element
  let triggerElement: React.ReactNode

  if (standalone) {
    if (React.isValidElement(activeTrigger)) {
      triggerElement = activeTrigger
    } else {
      // Wrap scalar values in span for asChild compatibility
      triggerElement = <span>{activeTrigger}</span>
    }
  } else {
    // Always wrap in span with anchorClassName for backwards compatibility
    triggerElement = <span className={anchorClassName}>{activeTrigger}</span>
  }

  const placement =
    anchorPosition && anchorPositionMap[anchorPosition]?.placement
  const align = anchorPosition && anchorPositionMap[anchorPosition]?.align
  // TODO: maybe use wrapped popover instead of inline style?!
  const padding = panelPaddingSize && panelPaddingSizeMap[panelPaddingSize]
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
      content={
      children && customOutsideDetector ? (
        <OutsideClickDetector
          onOutsideClick={(event) => closePopover?.(event as any)}
        >
          {children as JSX.Element}
        </OutsideClickDetector>
      ) : (
        children
      )
    }
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
