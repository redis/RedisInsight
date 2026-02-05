import { useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { NavigationService } from '@rdi-ui-poc/rdi-ui-pipeline'

/**
 * Creates a NavigationService implementation using React Router v5.
 * This service is injected into the PipelineProvider to handle URL-based routing.
 *
 * React Router's useLocation hook triggers re-renders on navigation,
 * so no subscription mechanism is needed.
 */
export const useRouterNavigation = (): NavigationService => {
  const history = useHistory()
  const location = useLocation()

  return useMemo(
    () => ({
      getPath: () => location.pathname,
      navigate: (path: string) => history.push(path),
    }),
    [history, location.pathname],
  )
}
