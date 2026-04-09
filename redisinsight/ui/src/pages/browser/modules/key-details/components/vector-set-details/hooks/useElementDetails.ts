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

  const handleViewElement = useCallback(
    (element: VectorSetElement) => {
      if (!keyName) return

      dispatch(
        getVectorSetElementAttribute(
          keyName as RedisResponseBuffer,
          element.name,
          (attributes) => {
            setViewedElement({ ...element, attributes })
          },
        ),
      )
    },
    [dispatch, keyName],
  )

  const handleClosePanel = useCallback(() => {
    setViewedElement(null)
  }, [])

  return {
    viewedElement,
    isDetailsPanelOpen: !!viewedElement,
    handleViewElement,
    handleClosePanel,
  }
}
