import throttle from 'lodash/throttle'
import React, { ReactNode, useEffect, useState } from 'react'

export const Breakpoints = ['xs', 's', 'm', 'l', 'xl'] as const
export type BreakpointKey = (typeof Breakpoints)[number]
type CurrentBreakpoint = BreakpointKey | undefined

// Explicitly list out each key so we can document default values
// via JSDoc (which is available to devs in IDE via intellisense)
export type BreakpointsType = Record<BreakpointKey, number>

export const breakpoints: BreakpointsType = {
  xl: 1200,
  l: 992,
  m: 768,
  s: 575,
  xs: 0,
}

export interface ShowHideForProps {
  /**
   * Required otherwise nothing ever gets returned
   */
  children: ReactNode
  /**
   * List of all the responsive sizes to hide the children for.
   * Array of #BreakpointKey
   */
  sizes: BreakpointKey[] | 'all' | 'none'
}

export const HideFor = ({ children, sizes }: ShowHideForProps) => {
  const currentBreakpoint = useCurrentBreakpoint()
  const isWithinBreakpointSizes =
    currentBreakpoint && sizes.includes(currentBreakpoint)

  if (sizes === 'all' || isWithinBreakpointSizes) {
    return null
  }
  return <>{children}</>
}

export const ShowFor = ({ children, sizes }: ShowHideForProps) => {
  const currentBreakpoint = useCurrentBreakpoint()
  const isWithinBreakpointSizes =
    currentBreakpoint && sizes.includes(currentBreakpoint)

  if (sizes === 'all' || isWithinBreakpointSizes) {
    return <>{children}</>
  }
  return null
}

// Find the breakpoint (key) whose value is <= windowWidth starting with the largest first
const getBreakpoint = (width: number) => {
  const breakpointKeys = Object.keys(breakpoints) as BreakpointKey[]
  const sortedBreakpoints = breakpointKeys.sort(
    (a, b) => breakpoints[b] - breakpoints[a],
  )
  return sortedBreakpoints.find(
    (key) => breakpoints[key as BreakpointKey] <= width,
  )
}

/**
 * Returns the current breakpoint based on window width.
 */
export const useCurrentBreakpoint = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<CurrentBreakpoint>(
    typeof window !== 'undefined'
      ? getBreakpoint(window.innerWidth)
      : undefined,
  )

  useEffect(() => {
    const onWindowResize = throttle(() => {
      setCurrentBreakpoint(getBreakpoint(window.innerWidth))
    }, 50)

    window.addEventListener('resize', onWindowResize)

    return () => window.removeEventListener('resize', onWindowResize)
  }, [])

  return currentBreakpoint
}
