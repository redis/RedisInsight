import { useEffect, useRef } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { Pages } from 'uiSrc/constants'

// Persists the last active sub-page (create-index or query) across mount/unmount cycles,
// so navigating away from Vector Search and back restores the previous sub-page.
// Scoped per instance to prevent cross-database navigation.
// Cleared after each restore to allow explicit navigation to the index list.
interface SavedPage {
  instanceId: string
  pathname: string
}

let lastViewedPage: SavedPage | null = null

export const useLastViewedPage = () => {
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()
  const { pathname } = useLocation()
  const pathnameRef = useRef<string>('')
  const instanceIdRef = useRef<string>(instanceId)

  useEffect(() => {
    instanceIdRef.current = instanceId
  }, [instanceId])

  useEffect(
    () => () => {
      if (pathnameRef.current) {
        lastViewedPage = {
          instanceId: instanceIdRef.current,
          pathname: pathnameRef.current,
        }
      }
    },
    [],
  )

  useEffect(() => {
    if (
      pathname === Pages.vectorSearch(instanceId) &&
      lastViewedPage?.instanceId === instanceId
    ) {
      const savedPage = lastViewedPage.pathname
      lastViewedPage = null
      history.push(savedPage)
      return
    }

    pathnameRef.current =
      pathname === Pages.vectorSearch(instanceId) ? '' : pathname
  }, [pathname])
}
