import React, { createContext, useContext, useState } from 'react'

export enum OpenDialogName {
  AddDatabase = 'add',
  ManageTags = 'manage-tags',
  EditDatabase = 'edit',
}

export interface HomePageDataProviderContextType {
  openDialog: OpenDialogName | null
  setOpenDialog: (openDialog: OpenDialogName | null) => void
}

export const HomePageDataProviderContext = createContext<
  HomePageDataProviderContextType | undefined
>(undefined)

export const HomePageDataProviderProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [openDialog, setOpenDialog] = useState<OpenDialogName | null>(null)

  return (
    <HomePageDataProviderContext.Provider
      value={{
        openDialog,
        setOpenDialog,
      }}
    >
      {children}
    </HomePageDataProviderContext.Provider>
  )
}

export const useHomePageDataProvider = () => {
  const context = useContext(HomePageDataProviderContext)

  if (!context) {
    throw new Error(
      'useHomePageDataProvider must be used within a HomePageDataProviderProvider',
    )
  }

  return context
}
