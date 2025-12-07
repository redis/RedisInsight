import React from 'react'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  render,
  userEvent,
  screen,
  toggleAccordion,
} from 'uiSrc/utils/test-utils'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import SettingsPage from './SettingsPage'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSso: {
      flag: false,
    },
  }),
}))

/**
 * SettingsPage tests
 *
 * @group component
 */
describe('SettingsPage', () => {
  it('should render', () => {
    expect(render(<SettingsPage />)).toBeTruthy()
  })

  it('Accordion "Appearance" should render', () => {
    const { container } = render(<SettingsPage />)

    expect(
      container.querySelector('[data-test-subj="accordion-appearance"]'),
    ).toBeInTheDocument()
    expect(render(<SettingsPage />)).toBeTruthy()
  })

  it('Accordion "Privacy settings" should render', () => {
    const { container } = render(<SettingsPage />)

    expect(
      container.querySelector('[data-test-subj="accordion-privacy-settings"]'),
    ).toBeInTheDocument()
    expect(render(<SettingsPage />)).toBeTruthy()
  })

  it('Accordion "Advanced settings" should render', () => {
    const { container } = render(<SettingsPage />)

    expect(
      container.querySelector('[data-test-subj="accordion-advanced-settings"]'),
    ).toBeInTheDocument()
    expect(render(<SettingsPage />)).toBeTruthy()
  })

  it('Accordion "Workbench settings" should render', () => {
    const { container } = render(<SettingsPage />)

    expect(
      container.querySelector(
        '[data-test-subj="accordion-workbench-settings"]',
      ),
    ).toBeInTheDocument()
    expect(render(<SettingsPage />)).toBeTruthy()
  })

  it('should not render cloud accordion without feature flag', () => {
    const { container } = render(<SettingsPage />)

    expect(
      container.querySelector('[data-test-subj="accordion-cloud-settings"]'),
    ).not.toBeInTheDocument()
    expect(render(<SettingsPage />)).toBeTruthy()
  })

  it('should render cloud accordion with feature flag', () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      cloudSso: {
        flag: true,
      },
    })
    const { container } = render(<SettingsPage />)

    expect(
      container.querySelector('[data-test-subj="accordion-cloud-settings"]'),
    ).toBeInTheDocument()
    expect(render(<SettingsPage />)).toBeTruthy()
  })
})

describe('Telemetry', () => {
  it('change Cleanup setting', async () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    sendEventTelemetry.mockReset()

    render(<SettingsPage />)
    await toggleAccordion('accordion-workbench-settings')
    await userEvent.click(screen.getByTestId('switch-workbench-cleanup'))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SETTINGS_WORKBENCH_EDITOR_CLEAR_CHANGED,
      eventData: {
        currentValue: true,
        newValue: false,
      },
    })
  })
})
