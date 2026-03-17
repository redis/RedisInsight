import { createContext, useContext } from 'react'

import { CreateIndexOnboardingStep } from '../../components/create-index-onboarding/CreateIndexOnboarding.constants'

export interface CreateIndexOnboardingContextValue {
  currentStep: CreateIndexOnboardingStep | null
  isActive: boolean
  totalSteps: number
  startOnboarding: () => void
  nextStep: () => void
  prevStep: () => void
  skipOnboarding: () => void
}

export const CreateIndexOnboardingContext =
  createContext<CreateIndexOnboardingContextValue>({
    currentStep: null,
    isActive: false,
    totalSteps: 0,
    startOnboarding: () => {},
    nextStep: () => {},
    prevStep: () => {},
    skipOnboarding: () => {},
  })

export const useCreateIndexOnboarding = () =>
  useContext(CreateIndexOnboardingContext)
