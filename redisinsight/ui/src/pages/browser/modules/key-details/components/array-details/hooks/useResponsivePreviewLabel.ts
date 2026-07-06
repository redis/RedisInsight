import { useCallback, useEffect, useRef, useState } from 'react'

import { PREVIEW_LABEL_WIDE_MIN_WIDTH } from '../preview-toggle/PreviewToggle.constants'

interface UseResponsivePreviewLabel {
  /** Attach to the element whose width decides the preview label. */
  containerRef: React.RefObject<HTMLDivElement>
  /** True once the container is wide enough for the full label. */
  isWide: boolean
}

/**
 * Tracks the width of a form's action row and reports whether it's wide
 * enough for the full "Preview command" label. Starts narrow so the shorter
 * label can never overflow before the first measurement. Mirrors the
 * `useResponsiveColumns` ResizeObserver pattern.
 */
export const useResponsivePreviewLabel = (): UseResponsivePreviewLabel => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isWide, setIsWide] = useState(false)

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0]
    if (entry) {
      setIsWide(entry.contentRect.width >= PREVIEW_LABEL_WIDE_MIN_WIDTH)
    }
  }, [])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return undefined

    const observer = new ResizeObserver(handleResize)
    observer.observe(element)

    return () => observer.disconnect()
  }, [handleResize])

  return { containerRef, isWide }
}
