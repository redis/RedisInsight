import React from 'react'
import { Stepper } from 'uiSrc/components/base/layout'

const VECTOR_SEARCH_ONBOARDING_STEPS = [
  { label: 'Select or create a database' },
  { label: 'Add data' },
  { label: 'Create an index' },
  { label: 'Search & query' },
]

const StepperComponent = () => (
  <Stepper steps={VECTOR_SEARCH_ONBOARDING_STEPS} currentStep={1} />
)

export default StepperComponent
