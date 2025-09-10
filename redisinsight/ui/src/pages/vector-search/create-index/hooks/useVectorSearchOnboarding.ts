import { useCallback, useState } from 'react'
import { BrowserStorageItem } from 'uiSrc/constants'

interface VectorSearchOnboardingHook {
  showOnboarding: boolean
  markOnboardingAsSeen: () => void
}

const useVectorSearchOnboarding = (): VectorSearchOnboardingHook => {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return (
      localStorage.getItem(BrowserStorageItem.vectorSearchOnboarding) !== 'true'
    )
  })

  const markOnboardingAsSeen = useCallback(() => {
    localStorage.setItem(BrowserStorageItem.vectorSearchOnboarding, 'true')
    setShowOnboarding(false)
  }, [])

  return { showOnboarding, markOnboardingAsSeen }
}

export default useVectorSearchOnboarding
