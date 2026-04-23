import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { getVectorSetElementDetails } from 'uiSrc/slices/browser/vectorSet'
import { bufferToString } from 'uiSrc/utils'
import { VectorSetElement, RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { UseElementDetailsResult } from './useElementDetails.types'

export const useElementDetails = (): UseElementDetailsResult => {
  const dispatch = useDispatch()
  const { name: keyName } = useSelector(selectedKeyDataSelector) ?? {}
  const keyNameString = bufferToString(keyName)

  const [viewedElement, setViewedElement] = useState<VectorSetElement | null>(
    null,
  )
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false)

  const prevKeyNameRef = useRef(keyNameString)

  useEffect(() => {
    if (prevKeyNameRef.current === keyNameString) return
    prevKeyNameRef.current = keyNameString

    setIsDetailsPanelOpen(false)
    setViewedElement(null)
  }, [keyNameString])

  const handleViewElement = useCallback(
    (element: VectorSetElement) => {
      if (!keyName) return

      dispatch(
        getVectorSetElementDetails(
          keyName as RedisResponseBuffer,
          element.name,
          (details) => {
            setViewedElement(details)
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
