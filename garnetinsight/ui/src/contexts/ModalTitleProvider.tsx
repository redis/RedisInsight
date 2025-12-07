import React, { createContext, useContext } from 'react'
import { Nullable } from 'uiSrc/utils'

interface ModalHeaderContextType {
  modalHeader: Nullable<React.ReactNode>
  setModalHeader: (
    content: Nullable<React.ReactNode>,
    withBack?: boolean,
  ) => void
}

// Create a context
const ModalHeaderContext = createContext<ModalHeaderContextType>({
  modalHeader: null,
  setModalHeader: () => {},
})

// Custom hook to access the header context
export const useModalHeader = () => useContext(ModalHeaderContext)
export const ModalHeaderProvider = ModalHeaderContext.Provider
