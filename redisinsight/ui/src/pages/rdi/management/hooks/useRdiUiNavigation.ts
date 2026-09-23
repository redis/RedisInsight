import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import type { NavigationOptions, NavigationService } from '@redislabsdev/rdi-ui'
import { Pages } from 'uiSrc/constants'

/**
 * Bridges @redislabsdev/rdi-ui's NavigationService onto RedisInsight's
 * react-router history, so the package drives the real browser URL instead of
 * keeping routing state internally.
 *
 * Paths handed to `navigate` are already absolute — the package prefixes them
 * with the `basePath` it was mounted with.
 */
export const useRdiUiNavigation = (): NavigationService => {
  const history = useHistory()

  return useMemo(
    () => ({
      getPath: () =>
        `${history.location.pathname}${history.location.search || ''}`,
      navigate: (path: string, options?: NavigationOptions) => {
        if (options?.replace) {
          history.replace(path)
        } else {
          history.push(path)
        }
      },
      goBack: () => {
        history.goBack()
      },
      // Leaving pipeline management drops the user back on the instances list.
      exit: () => {
        history.push(Pages.rdi)
      },
      subscribe: (callback: () => void) => history.listen(callback),
    }),
    [history],
  )
}
