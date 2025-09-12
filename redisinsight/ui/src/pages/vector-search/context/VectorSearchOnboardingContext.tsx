import React, { createContext, useContext, useState, useCallback } from 'react'
import { BrowserStorageItem } from 'uiSrc/constants'

export interface VectorSearchOnboardingContextType {
  showOnboarding: boolean
  setOnboardingSeen: () => void
  setOnboardingSeenSilent: () => void
}

export const VectorSearchOnboardingContext = createContext<
  VectorSearchOnboardingContextType | undefined
>(undefined)

export const VectorSearchOnboardingProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  // Read from localStorage on mount
  const [showOnboarding, setShowOnboarding] = useState<boolean>(
    () =>
      localStorage.getItem(BrowserStorageItem.vectorSearchOnboarding) !==
      'true',
  )

  // Update both state and localStorage (forces re-render)
  const setOnboardingSeen = useCallback(() => {
    localStorage.setItem(BrowserStorageItem.vectorSearchOnboarding, 'true')
    setShowOnboarding(false)
  }, [])

  // Update only localStorage (no re-render)
  const setOnboardingSeenSilent = useCallback(() => {
    localStorage.setItem(BrowserStorageItem.vectorSearchOnboarding, 'true')
    // Do not update state
  }, [])

  return (
    <VectorSearchOnboardingContext.Provider
      value={{
        showOnboarding,
        setOnboardingSeen,
        setOnboardingSeenSilent,
      }}
    >
      {children}
    </VectorSearchOnboardingContext.Provider>
  )
}

export const useVectorSearchOnboarding = () => {
  const context = useContext(VectorSearchOnboardingContext)

  if (!context) {
    throw new Error(
      'useVectorSearchOnboarding must be used within a VectorSearchOnboardingProvider',
    )
  }

  return context
}
