import React from 'react'

export interface OnboardingTourInner {
  content: string | React.ReactElement
  onSkip?: () => void
  onBack?: () => void
  onNext?: () => void
}

export interface OnboardingTourOptions {
  step: number
  title?: string | React.ReactElement
  Inner?: () => OnboardingTourInner
}
