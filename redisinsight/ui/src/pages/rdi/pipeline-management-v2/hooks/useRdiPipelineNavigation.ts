import { useMemo, useRef } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { NavigationService } from '@rdi-ui/pipeline'
import { Pages } from 'uiSrc/constants'

export const useRdiPipelineNavigation = (): NavigationService => {
  const history = useHistory()
  const location = useLocation()

  // Read via a ref (kept fresh every render) rather than closing over
  // location.pathname directly, so getPath() stays current even if the
  // package captures this object once and never re-reads the prop -
  // recreating the whole object on every navigation would otherwise be
  // the only way to keep it fresh, retriggering the package's own effects.
  const pathnameRef = useRef(location.pathname)
  pathnameRef.current = location.pathname

  return useMemo(
    () => ({
      getPath: () => pathnameRef.current,
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
