import { useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { NavigationService } from '@rdi-ui/pipeline'
import { Pages } from 'uiSrc/constants'

export const useRdiPipelineNavigation = (): NavigationService => {
  const history = useHistory()
  const location = useLocation()

  return useMemo(
    () => ({
      getPath: () => location.pathname,
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
    [history, location.pathname],
  )
}
