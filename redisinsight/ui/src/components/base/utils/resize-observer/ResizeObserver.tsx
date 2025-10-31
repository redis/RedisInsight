import React, { useEffect, useRef } from 'react'

interface RIResizeObserverProps {
  children: (ref: React.Ref<HTMLDivElement>) => React.ReactNode
  onResize: (dimensions: { height: number; width: number }) => void
}

export const RIResizeObserver: React.FC<RIResizeObserverProps> = ({
  children,
  onResize,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = containerRef.current
    if (element) {
      const observer = new window.ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect
        onResize({ width, height })
      })

      observer.observe(element)

      return () => {
        observer.disconnect()
      }
    }
  }, [onResize, containerRef.current])

  return <>{children(containerRef)}</>
}

export default RIResizeObserver
