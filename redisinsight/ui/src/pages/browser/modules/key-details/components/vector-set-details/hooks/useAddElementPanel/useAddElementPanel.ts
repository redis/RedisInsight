import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { bufferToString } from 'uiSrc/utils'

import {
  UseAddElementPanelParams,
  UseAddElementPanelResult,
} from './useAddElementPanel.types'

export const useAddElementPanel = ({
  onOpenAddItemPanel,
  onCloseAddItemPanel,
}: UseAddElementPanelParams): UseAddElementPanelResult => {
  const selectedKeyData = useSelector(selectedKeyDataSelector)
  const keyName = bufferToString(selectedKeyData?.name)

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState(false)
  const prevKeyNameRef = useRef(keyName)

  const openAddItemPanel = useCallback(() => {
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }, [onOpenAddItemPanel])

  const closeAddItemPanel = useCallback(
    (isCancelled?: boolean) => {
      setIsAddItemPanelOpen(false)
      if (isCancelled) {
        onCloseAddItemPanel()
      }
    },
    [onCloseAddItemPanel],
  )

  useEffect(() => {
    if (prevKeyNameRef.current === keyName) return
    prevKeyNameRef.current = keyName

    if (!keyName) return

    setIsAddItemPanelOpen((open) => {
      if (open) onCloseAddItemPanel()
      return false
    })
  }, [keyName, onCloseAddItemPanel])

  return {
    isAddItemPanelOpen,
    openAddItemPanel,
    closeAddItemPanel,
  }
}
