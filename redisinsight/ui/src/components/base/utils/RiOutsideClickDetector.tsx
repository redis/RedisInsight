import {
  Children,
  cloneElement,
  EventHandler,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { useGenerateId } from 'uiSrc/components/base/utils/hooks/generate-id'

export interface RIEvent extends Event {
  riGeneratedBy: string[]
}

export interface OutsideClickDetectorProps {
  /**
   * ReactNode to render as this component's content
   */
  children: ReactElement
  onOutsideClick: (event: Event) => void
  isDisabled?: boolean
  onMouseDown?: (event: ReactMouseEvent) => void
  onMouseUp?: (event: ReactMouseEvent) => void
  onTouchStart?: (event: ReactMouseEvent) => void
  onTouchEnd?: (event: ReactMouseEvent) => void
}

// We are working with the assumption that a click event is
// equivalent to a sequential, compound press and release of
// the pointing device (mouse, finger, stylus, etc.).
// A click event's target can be imprecise, as the value will be
// the closest common ancestor of the press (mousedown, touchstart)
// and release (mouseup, touchend) events (often <body />) if
// the the target of each event differs.
// We need the actual event targets to make the correct decisions
// about user intention. So, consider the down/start and up/end
// items below as the deconstruction of a click event.
export const RiOutsideClickDetector = ({
  children,
  onOutsideClick,
  isDisabled,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
}: OutsideClickDetectorProps) => {
  const genId = useGenerateId()
  // the id is used to identify which EuiOutsideClickDetector
  // is the source of a click event; as the click event bubbles
  // up and reaches the click detector's child component the
  // id value is stamped on the event. This id is inspected
  // in the document's click handler, and if the id doesn't
  // exist or doesn't match this detector's id, then trigger
  // the outsideClick callback.
  //
  // Taking this approach instead of checking if the event's
  // target element exists in this component's DOM subtree is
  // necessary for handling clicks originating from children
  // rendered through React's portals (EuiPortal). The id tracking
  // works because React guarantees the event bubbles through the
  // virtual DOM and executes EuiClickDetector's onClick handler,
  // stamping the id even though the event originates outside
  // this component's reified DOM tree.
  const id = useRef(genId)

  const capturedDownIds = useRef<string[]>([])
  const onClickOutside: EventHandler<any> = useCallback(
    (e: Event) => {
      if (isDisabled) {
        capturedDownIds.current = []
        return
      }

      const event = e as unknown as RIEvent

      if (
        (event.riGeneratedBy && event.riGeneratedBy.includes(id.current)) ||
        capturedDownIds.current.includes(id.current)
      ) {
        capturedDownIds.current = []
        return
      }
      capturedDownIds.current = []
      onOutsideClick(event)
    },
    [isDisabled, onOutsideClick],
  )
  useEffect(() => {
    document.addEventListener('mouseup', onClickOutside)
    document.addEventListener('touchend', onClickOutside)

    return () => {
      document.removeEventListener('mouseup', onClickOutside)
      document.removeEventListener('touchend', onClickOutside)
    }
  }, [onClickOutside])

  const onChildClick = (
    event: ReactMouseEvent,
    cb: (event: ReactMouseEvent) => void,
  ) => {
    // to support nested click detectors, build an array
    // of detector ids that have been encountered;
    if (
      Object.prototype.hasOwnProperty.call(event.nativeEvent, 'riGeneratedBy')
    ) {
      ;(event.nativeEvent as unknown as RIEvent).riGeneratedBy.push(id.current)
    } else {
      ;(event.nativeEvent as unknown as RIEvent).riGeneratedBy = [id.current]
    }
    if (cb) cb(event)
  }

  const onChildMouseDown = (event: ReactMouseEvent) => {
    onChildClick(event, (e) => {
      const nativeEvent = e.nativeEvent as unknown as RIEvent
      capturedDownIds.current = nativeEvent.riGeneratedBy
      if (onMouseDown) onMouseDown(e)
      if (onTouchStart) onTouchStart(e)
    })
  }

  const onChildMouseUp = (event: ReactMouseEvent) => {
    onChildClick(event, (e) => {
      if (onMouseUp) onMouseUp(e)
      if (onTouchEnd) onTouchEnd(e)
    })
  }
  const props = {
    ...children.props,
    ...{
      onMouseDown: onChildMouseDown,
      onTouchStart: onChildMouseDown,
      onMouseUp: onChildMouseUp,
      onTouchEnd: onChildMouseUp,
    },
  }

  const child = Children.only(children)
  return cloneElement(child, props)
}
