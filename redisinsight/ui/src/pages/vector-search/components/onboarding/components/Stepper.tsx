import React from 'react'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'
import { DottedArrow, Step, StepBadge, StepLabel } from './Stepper.styles'

export interface StepItem {
  step: string
  text: string
  isCompleted?: boolean
}

const VECTOR_SEARCH_ONBOARDING_STEPS: StepItem[] = [
  {
    step: '1',
    text: 'Select or create a database',
    isCompleted: true,
  },
  {
    step: '2',
    text: 'Add data',
  },
  {
    step: '3',
    text: 'Create an index',
  },
  {
    step: '4',
    text: 'Search & query',
  },
]

const Stepper: React.FC = () => (
  <FlexGroup
    grow={false}
    gap="l"
    data-testid="vector-search-onboarding--stepper"
  >
    {VECTOR_SEARCH_ONBOARDING_STEPS.map((item) => (
      <Step gap="m" align="center" key={item.step}>
        <StepBadge justify="center" align="center">
          {item.step}
        </StepBadge>

        <StepLabel size="M" color="primary" $isCompleted={item.isCompleted}>
          {item.text}
        </StepLabel>

        {item.step !==
          VECTOR_SEARCH_ONBOARDING_STEPS[
            VECTOR_SEARCH_ONBOARDING_STEPS.length - 1
          ].step && <DottedArrow />}
      </Step>
    ))}
  </FlexGroup>
)

export default Stepper
