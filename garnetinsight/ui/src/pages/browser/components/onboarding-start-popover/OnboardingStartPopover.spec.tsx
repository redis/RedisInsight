import React from 'react'

import { cloneDeep } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  mockedStore,
  cleanup,
  clearStoreActions,
} from 'uiSrc/utils/test-utils'
import { setOnboardNextStep, skipOnboarding } from 'uiSrc/slices/app/features'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OnboardingStepName } from 'uiSrc/constants/onboarding'
import OnboardingStartPopover from './OnboardingStartPopover'

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureOnboardingSelector: jest.fn().mockReturnValue({
    currentStep: 0,
    isActive: true,
    totalSteps: 14,
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('OnboardingStartPopover', () => {
  it('should render', () => {
    expect(render(<OnboardingStartPopover />)).toBeTruthy()
  })

  it('should render start popover', () => {
    render(<OnboardingStartPopover />)

    expect(screen.getByTestId('onboarding-start-popover')).toBeInTheDocument()
    expect(screen.getByTestId('onboarding-start-content')).toBeInTheDocument()
  })

  it('should call proper actions after click start', () => {
    render(<OnboardingStartPopover />)

    fireEvent.click(screen.getByTestId('start-tour-btn'))

    const expectedActions = [setOnboardNextStep()]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })

  it('should call proper actions after click skip button', () => {
    render(<OnboardingStartPopover />)

    fireEvent.click(screen.getByTestId('skip-tour-btn'))

    const expectedActions = [skipOnboarding()]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })

  it('should call proper telemetry after click start', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(<OnboardingStartPopover />)

    fireEvent.click(screen.getByTestId('start-tour-btn'))
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.ONBOARDING_TOUR_CLICKED,
      eventData: {
        action: 'next',
        databaseId: '',
        step: OnboardingStepName.Start,
      },
    })
    sendEventTelemetry.mockRestore()
  })

  it('should call proper telemetry after click skip button', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(<OnboardingStartPopover />)

    fireEvent.click(screen.getByTestId('skip-tour-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.ONBOARDING_TOUR_CLICKED,
      eventData: {
        action: 'closed',
        databaseId: '',
        step: OnboardingStepName.Start,
      },
    })
    sendEventTelemetry.mockRestore()
  })
})
