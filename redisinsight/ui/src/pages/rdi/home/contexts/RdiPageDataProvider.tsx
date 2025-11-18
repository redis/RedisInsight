import React, { createContext, useContext, useState } from 'react'

import { RdiInstance } from 'uiSrc/slices/interfaces'

export interface RdiPageDataProviderContextType {
  editInstance: RdiInstance | null
  setEditInstance: (instance: RdiInstance | null) => void
  isConnectionFormOpen: boolean
  setIsConnectionFormOpen: (isOpen: boolean) => void
}

export const RdiPageDataProviderContext = createContext<
  RdiPageDataProviderContextType | undefined
>(undefined)

export const RdiPageDataProviderProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [editInstance, setEditInstance] = useState<RdiInstance | null>(null)
  const [isConnectionFormOpen, setIsConnectionFormOpen] = useState(false)

  return (
    <RdiPageDataProviderContext.Provider
      value={{
        editInstance,
        setEditInstance,
        isConnectionFormOpen,
        setIsConnectionFormOpen,
      }}
    >
      {children}
    </RdiPageDataProviderContext.Provider>
  )
}

export const useRdiPageDataProvider = () => {
  const context = useContext(RdiPageDataProviderContext)

  if (!context) {
    throw new Error(
      'useRdiPageDataProvider must be used within a RdiPageDataProviderProvider',
    )
  }

  return context
}
