import React from 'react'
import { Stepper } from 'uiSrc/components/base/layout'

const VECTOR_SEARCH_ONBOARDING_STEPS = [
  'Select or create a database',
  'Add data',
  'Create an index',
  'Search & query',
]

const StepperComponent = () => (
  <Stepper currentStep={1}>
    {VECTOR_SEARCH_ONBOARDING_STEPS.map((step) => (
      <Stepper.Step key={step}>{step}</Stepper.Step>
    ))}
  </Stepper>
)

export default StepperComponent
