import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { NavigationService } from '@rdi-ui/pipeline'
import { Pages } from 'uiSrc/constants'

export const useRdiPipelineNavigation = (): NavigationService => {
  const history = useHistory()

  return useMemo(
    () => ({
      // history.location is always current, so this doesn't go stale even
      // if the package captures the object once and never re-reads the prop
      // rdi-ui reads wizard state from the query string (e.g. `?addSource=true`),
      // so the path it parses has to keep it
      getPath: () =>
        `${history.location.pathname}${history.location.search || ''}`,
      navigate: (path, options) => {
        if (options?.replace) {
          history.replace(path)
        } else {
          history.push(path)
        }
      },
      goBack: () => history.goBack(),
      exit: () => history.push(Pages.rdi),
      subscribe: (callback) => history.listen(() => callback()),
    }),
    [history],
  )
}
