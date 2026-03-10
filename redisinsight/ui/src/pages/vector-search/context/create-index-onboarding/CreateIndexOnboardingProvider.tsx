import React, { useCallback, useMemo, useRef, useState } from 'react'

import BrowserStorageItem from 'uiSrc/constants/storage'
import { localStorageService } from 'uiSrc/services'

import {
  CreateIndexOnboardingStep,
  ONBOARDING_STEPS,
} from '../../components/create-index-onboarding/CreateIndexOnboarding.constants'
import {
  CreateIndexOnboardingContext,
  CreateIndexOnboardingContextValue,
} from './CreateIndexOnboardingContext'

const isOnboardingSeen = (): boolean =>
  localStorageService.get(
    BrowserStorageItem.vectorSearchCreateIndexOnboarding,
  ) === true

const markOnboardingSeen = () => {
  localStorageService.set(
    BrowserStorageItem.vectorSearchCreateIndexOnboarding,
    true,
  )
}

export interface CreateIndexOnboardingProviderProps {
  children: React.ReactNode
}

export const CreateIndexOnboardingProvider = ({
  children,
}: CreateIndexOnboardingProviderProps) => {
  const [currentStep, setCurrentStep] =
    useState<CreateIndexOnboardingStep | null>(null)
  const [isActive, setIsActive] = useState(false)

  const isActiveRef = useRef(isActive)
  isActiveRef.current = isActive

  const startOnboarding = useCallback(() => {
    if (isActiveRef.current) return
    if (isOnboardingSeen()) return

    setCurrentStep(ONBOARDING_STEPS[0])
    setIsActive(true)
  }, [])

  const skipOnboarding = useCallback(() => {
    if (!isActiveRef.current) return

    markOnboardingSeen()
    setIsActive(false)
    setCurrentStep(null)
  }, [])

  const nextStep = useCallback(() => {
    if (!isActiveRef.current) return

    setCurrentStep((prev) => {
      if (!prev) return null

      const currentIndex = ONBOARDING_STEPS.indexOf(
        prev as (typeof ONBOARDING_STEPS)[number],
      )

      if (currentIndex === -1) {
        markOnboardingSeen()
        setIsActive(false)
        return null
      }

      const nextIndex = currentIndex + 1

      if (nextIndex >= ONBOARDING_STEPS.length) {
        markOnboardingSeen()
        setIsActive(false)
        return null
      }

      return ONBOARDING_STEPS[nextIndex]
    })
  }, [])

  const prevStep = useCallback(() => {
    if (!isActiveRef.current) return

    setCurrentStep((prev) => {
      if (!prev) return null

      const currentIndex = ONBOARDING_STEPS.indexOf(
        prev as (typeof ONBOARDING_STEPS)[number],
      )

      if (currentIndex <= 0) return prev

      return ONBOARDING_STEPS[currentIndex - 1]
    })
  }, [])

  const value: CreateIndexOnboardingContextValue = useMemo(
    () => ({
      currentStep,
      isActive,
      totalSteps: ONBOARDING_STEPS.length,
      startOnboarding,
      nextStep,
      prevStep,
      skipOnboarding,
    }),
    [
      currentStep,
      isActive,
      startOnboarding,
      nextStep,
      prevStep,
      skipOnboarding,
    ],
  )

  return (
    <CreateIndexOnboardingContext.Provider value={value}>
      {children}
    </CreateIndexOnboardingContext.Provider>
  )
}
