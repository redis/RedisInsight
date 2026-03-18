import { useEffect, useRef } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { Pages } from 'uiSrc/constants'

// Persists the last active sub-page (create-index or query) across mount/unmount cycles,
// so navigating away from Vector Search and back restores the previous sub-page.
// Cleared after each restore to allow explicit navigation to the index list.
let lastViewedPage = ''

export const useLastViewedPage = () => {
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()
  const { pathname } = useLocation()
  const pathnameRef = useRef<string>('')

  useEffect(
    () => () => {
      lastViewedPage = pathnameRef.current
    },
    [],
  )

  useEffect(() => {
    if (pathname === Pages.vectorSearch(instanceId) && lastViewedPage) {
      const savedPage = lastViewedPage
      lastViewedPage = ''
      history.push(savedPage)
      return
    }

    pathnameRef.current =
      pathname === Pages.vectorSearch(instanceId) ? '' : pathname
  }, [pathname])
}
