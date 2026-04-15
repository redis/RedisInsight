import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { getVectorSetElementAttribute } from 'uiSrc/slices/browser/vectorSet'
import { VectorSetElement, RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export const useElementDetails = () => {
  const dispatch = useDispatch()
  const { name: keyName } = useSelector(selectedKeyDataSelector) ?? {}

  const [viewedElement, setViewedElement] = useState<VectorSetElement | null>(
    null,
  )
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false)

  const handleViewElement = useCallback(
    (element: VectorSetElement) => {
      if (!keyName) return

      dispatch(
        getVectorSetElementAttribute(
          keyName as RedisResponseBuffer,
          element.name,
          (attributes) => {
            setViewedElement({ ...element, attributes })
            setIsDetailsPanelOpen(true)
          },
        ),
      )
    },
    [dispatch, keyName],
  )

  const handleClosePanel = useCallback(() => {
    setIsDetailsPanelOpen(false)
  }, [])

  const handleDrawerDidClose = useCallback(() => {
    setViewedElement(null)
  }, [])

  return {
    viewedElement,
    isDetailsPanelOpen,
    handleViewElement,
    handleClosePanel,
    handleDrawerDidClose,
  }
}
