import { useEffect } from 'react'

type EventNames = keyof WindowEventMap

interface WindowEventProps<Ev extends EventNames> {
  event: Ev
  handler: (ev: WindowEventMap[Ev]) => any
}

/**
 * Adds an event listener to the window object and cleans it up when the component
 * is unmounted.
 *
 * @example
 *
 * ```tsx
 * useWindowEvent('resize', handleResize)
 * ```
 */
export function useWindowEvent<EName extends EventNames>(
  event: WindowEventProps<EName>['event'],
  handler: WindowEventProps<EName>['handler'],
) {
  useEffect(() => {
    window.addEventListener(event, handler)
    return () => {
      window.removeEventListener(event, handler)
    }
  }, [event, handler])
}

/**
 * A component that adds an event listener to the window object and cleans it up when it is unmounted.
 *
 * Added for convenience, replacing EuiWindowEvent, but for future uses, the useWindowEvent hook is recommended.
 * @example
 *
 * ```tsx
 * <WindowEvent event="resize" handler={handleResize} />
 * ```
 */
export function WindowEvent<EName extends EventNames>({
  event,
  handler,
}: WindowEventProps<EName>) {
  useWindowEvent(event, handler)
  return null
}
