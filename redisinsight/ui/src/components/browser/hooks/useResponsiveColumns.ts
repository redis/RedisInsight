import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BrowserColumns } from 'uiSrc/constants'

/**
 * Responsive column hiding breakpoints (in pixels):
 * - >= 500px: show all user-enabled columns
 * - 400-500px: auto-hide Size column
 * - 300-400px: auto-hide both Size and TTL columns
 * - ~300px (minimum): show only Type + Key name
 */
const BREAKPOINT_HIDE_SIZE = 500
const BREAKPOINT_HIDE_TTL = 400

export const getEffectiveColumns = (
  shownColumns: BrowserColumns[],
  width: number,
): BrowserColumns[] => {
  if (width >= BREAKPOINT_HIDE_SIZE) {
    return shownColumns
  }

  if (width >= BREAKPOINT_HIDE_TTL) {
    return shownColumns.filter((col) => col !== BrowserColumns.Size)
  }

  return shownColumns.filter(
    (col) => col !== BrowserColumns.Size && col !== BrowserColumns.TTL,
  )
}

export const useResponsiveColumns = (
  shownColumns: BrowserColumns[],
): {
  effectiveColumns: BrowserColumns[]
  containerRef: React.RefObject<HTMLDivElement>
} => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(Infinity)

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0]
    if (entry) {
      setContainerWidth(entry.contentRect.width)
    }
  }, [])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return undefined

    const observer = new ResizeObserver(handleResize)
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [handleResize])

  // Derive a discrete breakpoint level so the memoized result only changes
  // when crossing a threshold, not on every pixel of resize.
  const breakpointLevel =
    containerWidth >= BREAKPOINT_HIDE_SIZE
      ? 2
      : containerWidth >= BREAKPOINT_HIDE_TTL
        ? 1
        : 0

  const effectiveColumns = useMemo(
    () => getEffectiveColumns(shownColumns, containerWidth),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shownColumns, breakpointLevel],
  )

  return { effectiveColumns, containerRef }
}
