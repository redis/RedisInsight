import React, { CSSProperties, useEffect, useState } from 'react'
import { FocusOn } from 'react-focus-on'
import { ReactFocusOnProps } from 'react-focus-on/dist/es5/types'
import { RemoveScrollBar } from 'react-remove-scroll-bar'

export type FocusTarget = HTMLElement | string | (() => HTMLElement)
const findElementBySelectorOrRef = (elementTarget?: FocusTarget) => {
  let node = elementTarget instanceof HTMLElement ? elementTarget : null
  if (typeof elementTarget === 'string') {
    node = document.querySelector(elementTarget as string)
  } else if (typeof elementTarget === 'function') {
    node = (elementTarget as () => HTMLElement)()
  }
  return node
}

export type FocusTrapProps = Omit<
  ReactFocusOnProps,
  // Inverted `disabled` prop used instead
  | 'enabled'
  // Props that differ from react-focus-on's default settings
  | 'gapMode'
  | 'crossFrame'
  | 'scrollLock'
  | 'noIsolation'
  | 'returnFocus'
> & {
  className?: string
  style?: CSSProperties
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * Whether `onClickOutside` should be called on mouseup instead of mousedown.
   * This flag can be used to prevent conflicts with outside toggle buttons by delaying the closing click callback.
   */
  closeOnMouseup?: boolean
  /**
   * Clicking outside the trap area will disable the trap
   * @default false
   */
  clickOutsideDisables?: boolean
  /**
   * Reference to element that will get focus when the trap is initiated
   */
  initialFocus?: FocusTarget
  /**
   * if `scrollLock` is set to true, the body's scrollbar width will be preserved on lock
   * via the `gapMode` CSS property. Depending on your custom CSS, you may prefer to use
   * `margin` instead of `padding`.
   * @default padding
   */
  gapMode?: 'padding' | 'margin'
  /**
   * Configures focus trapping between iframes.
   * By default, FocusTrap allows focus to leave iframes and move to elements outside of it.
   * Set to `true` if you want focus to remain trapped within the iframe.
   * @default false
   */
  crossFrame?: ReactFocusOnProps['crossFrame']
  /**
   * @default false
   */
  scrollLock?: ReactFocusOnProps['scrollLock']
  /**
   * @default true
   */
  noIsolation?: ReactFocusOnProps['noIsolation']
  /**
   * @default true
   */
  returnFocus?: ReactFocusOnProps['returnFocus']
}

// Programmatically sets focus on a nested DOM node; optional
const setInitialFocus = (initialFocus?: FocusTarget) => {
  if (!initialFocus) {
    return
  }
  const node = findElementBySelectorOrRef(initialFocus)
  if (!node) {
    return
  }
  // `data-autofocus` is part of the 'react-focus-on' API
  node.setAttribute('data-autofocus', 'true')
}

const removeMouseupListener = (
  onMouseupListener: (e: MouseEvent | TouchEvent) => void,
) => {
  document.removeEventListener('mouseup', onMouseupListener)
  document.removeEventListener('touchend', onMouseupListener)
}

const addMouseupListener = (
  onMouseupListener: (e: MouseEvent | TouchEvent) => void,
) => {
  document.addEventListener('mouseup', onMouseupListener)
  document.addEventListener('touchend', onMouseupListener)
}

const defaultProps = {
  clickOutsideDisables: false,
  disabled: false,
  returnFocus: true,
  noIsolation: true,
  scrollLock: false,
  crossFrame: false,
  gapMode: 'padding',
} as const

export const FocusTrap = ({
  children,
  clickOutsideDisables = defaultProps.clickOutsideDisables,
  closeOnMouseup,
  crossFrame = defaultProps.crossFrame,
  disabled = defaultProps.disabled,
  gapMode = defaultProps.gapMode,
  initialFocus,
  noIsolation = defaultProps.noIsolation,
  onClickOutside,
  returnFocus = defaultProps.returnFocus,
  scrollLock = defaultProps.scrollLock,
  ...rest
}: FocusTrapProps) => {
  const [hasBeenDisabledByClick, setHasBeenDisabledByClick] = useState(disabled)

  const onMouseupOutside = (e: MouseEvent | TouchEvent) => {
    // Timeout gives precedence to the consumer to initiate close if it has toggle behavior.
    // Otherwise, this event may occur first and the consumer toggle will reopen the flyout.
    setTimeout(() => onClickOutside?.(e))
  }
  useEffect(() => {
    setInitialFocus(initialFocus)
    return () => {
      removeMouseupListener(onMouseupOutside)
    }
  }, [])

  useEffect(() => {
    if (hasBeenDisabledByClick && disabled === false) {
      setHasBeenDisabledByClick(false)
    }
  }, [disabled])

  const handleOutsideClick: ReactFocusOnProps['onClickOutside'] = (event) => {
    if (clickOutsideDisables) {
      setHasBeenDisabledByClick(true)
    }

    if (onClickOutside) {
      closeOnMouseup
        ? addMouseupListener(onMouseupOutside)
        : onClickOutside(event)
    }
  }

  const isDisabled = disabled || hasBeenDisabledByClick
  const focusOnProps = {
    returnFocus,
    noIsolation,
    crossFrame,
    enabled: !isDisabled,
    ...rest,
    onClickOutside: handleOutsideClick,
    /**
     * `scrollLock` should always be unset on FocusOn, as it can prevent scrolling on
     * portals (i.e. popovers, comboboxes, dropdown menus, etc.) within modals & flyouts
     * @see https://github.com/theKashey/react-focus-on/issues/49
     */
    scrollLock: false,
  }
  return (
    <FocusOn {...focusOnProps}>
      {children}
      {!isDisabled && scrollLock && <RemoveScrollBar gapMode={gapMode} />}
    </FocusOn>
  )
}
