import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import BrowserStorageItem from 'uiSrc/constants/storage'
import { localStorageService } from 'uiSrc/services'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import {
  CreateIndexOnboardingStep,
  ONBOARDING_STEPS,
} from '../../components/create-index-onboarding/CreateIndexOnboarding.constants'
import { SearchOnboardingAction } from '../../telemetry.constants'
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

const isLastStep = (step: CreateIndexOnboardingStep | null): boolean =>
  step === ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1]

export interface CreateIndexOnboardingProviderProps {
  instanceId: string
  children: React.ReactNode
}

export const CreateIndexOnboardingProvider = ({
  instanceId,
  children,
}: CreateIndexOnboardingProviderProps) => {
  const [currentStep, setCurrentStep] =
    useState<CreateIndexOnboardingStep | null>(null)
  const [isActive, setIsActive] = useState(false)

  const isActiveRef = useRef(isActive)
  isActiveRef.current = isActive

  const currentStepRef = useRef(currentStep)
  currentStepRef.current = currentStep

  useEffect(() => {
    if (isActive && currentStep === null) {
      markOnboardingSeen()
      setIsActive(false)
    }
  }, [isActive, currentStep])

  const startOnboarding = useCallback(() => {
    if (isActiveRef.current) return
    if (isOnboardingSeen()) return

    setCurrentStep(ONBOARDING_STEPS[0])
    setIsActive(true)

    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_CREATE_INDEX_ONBOARDING_STARTED,
      eventData: { databaseId: instanceId },
    })
  }, [instanceId])

  const skipOnboarding = useCallback(() => {
    if (!isActiveRef.current) return

    const step = currentStepRef.current

    if (isLastStep(step)) {
      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_CREATE_INDEX_ONBOARDING_COMPLETED,
        eventData: { databaseId: instanceId },
      })
    } else {
      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_CREATE_INDEX_ONBOARDING_STEP_CLICKED,
        eventData: {
          databaseId: instanceId,
          step,
          action: SearchOnboardingAction.Skip,
        },
      })
    }

    markOnboardingSeen()
    setIsActive(false)
    setCurrentStep(null)
  }, [instanceId])

  const nextStep = useCallback(() => {
    if (!isActiveRef.current) return

    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_CREATE_INDEX_ONBOARDING_STEP_CLICKED,
      eventData: {
        databaseId: instanceId,
        step: currentStepRef.current,
        action: SearchOnboardingAction.Next,
      },
    })

    setCurrentStep((prev) => {
      if (!prev) return null

      const currentIndex = ONBOARDING_STEPS.findIndex((step) => step === prev)

      if (currentIndex === -1) return null

      const nextIndex = currentIndex + 1

      if (nextIndex >= ONBOARDING_STEPS.length) return null

      return ONBOARDING_STEPS[nextIndex]
    })
  }, [instanceId])

  const prevStep = useCallback(() => {
    if (!isActiveRef.current) return

    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_CREATE_INDEX_ONBOARDING_STEP_CLICKED,
      eventData: {
        databaseId: instanceId,
        step: currentStepRef.current,
        action: SearchOnboardingAction.Back,
      },
    })

    setCurrentStep((prev) => {
      if (!prev) return null

      const currentIndex = ONBOARDING_STEPS.findIndex((step) => step === prev)

      if (currentIndex <= 0) return prev

      return ONBOARDING_STEPS[currentIndex - 1]
    })
  }, [instanceId])

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
