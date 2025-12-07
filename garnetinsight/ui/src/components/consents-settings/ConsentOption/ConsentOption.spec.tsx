import React from 'react'
import { render, screen, userEvent } from 'uiSrc/utils/test-utils'
import ConsentOption from './ConsentOption'
import { IConsent } from '../ConsentsSettings'

const mockConsent: IConsent = {
  agreementName: 'analytics',
  title: 'Analytics',
  label: 'Share usage data',
  description: 'Help us improve Garnet Insight by sharing usage data.',
  required: false,
  editable: true,
  disabled: false,
  defaultValue: false,
  displayInSetting: true,
  since: '1.0.0',
  linkToPrivacyPolicy: false,
}

const mockOnChangeAgreement = jest.fn()

const defaultProps = {
  consent: mockConsent,
  onChangeAgreement: mockOnChangeAgreement,
  checked: false,
}

describe('ConsentOption', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(render(<ConsentOption {...defaultProps} />)).toBeTruthy()
  })

  it('should render switch with correct test id', () => {
    render(<ConsentOption {...defaultProps} />)
    expect(screen.getByTestId('switch-option-analytics')).toBeInTheDocument()
  })

  it('should call onChangeAgreement when switch is clicked', async () => {
    render(<ConsentOption {...defaultProps} />)

    await userEvent.click(screen.getByTestId('switch-option-analytics'))

    expect(mockOnChangeAgreement).toHaveBeenCalledWith(true, 'analytics')
  })

  it('should render description without privacy policy link when linkToPrivacyPolicy is false', () => {
    const consentWithDescription = {
      ...mockConsent,
      description: 'Help us improve Garnet Insight by sharing usage data.',
      linkToPrivacyPolicy: false,
    }

    render(<ConsentOption {...defaultProps} consent={consentWithDescription} />)

    expect(
      screen.getByText('Help us improve Garnet Insight by sharing usage data.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Privacy Policy')).not.toBeInTheDocument()
  })

  it('should render description with privacy policy link when linkToPrivacyPolicy is true', () => {
    const consentWithPrivacyLink = {
      ...mockConsent,
      description: 'Help us improve Garnet Insight by sharing usage data.',
      linkToPrivacyPolicy: true,
    }

    render(<ConsentOption {...defaultProps} consent={consentWithPrivacyLink} />)

    // Verify that the Privacy Policy link is rendered
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()

    const privacyPolicyLink = screen.getByText('Privacy Policy')
    expect(privacyPolicyLink.closest('a')).toHaveAttribute(
      'href',
      'https://redis.io/legal/privacy-policy/?utm_source=garnetinsight&utm_medium=app&utm_campaign=telemetry',
    )
  })

  it('should render description with privacy policy link on settings page when linkToPrivacyPolicy is true', () => {
    const consentWithPrivacyLink = {
      ...mockConsent,
      description: 'Help us improve Garnet Insight by sharing usage data.',
      linkToPrivacyPolicy: true,
    }

    render(
      <ConsentOption
        {...defaultProps}
        consent={consentWithPrivacyLink}
        isSettingsPage
      />,
    )

    // Verify that the Privacy Policy link is rendered
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
  })

  it('should not render privacy policy link on settings page when linkToPrivacyPolicy is false', () => {
    const consentWithoutPrivacyLink = {
      ...mockConsent,
      description: 'Help us improve Garnet Insight by sharing usage data.',
      linkToPrivacyPolicy: false,
    }

    render(
      <ConsentOption
        {...defaultProps}
        consent={consentWithoutPrivacyLink}
        isSettingsPage
      />,
    )

    expect(
      screen.getByText('Help us improve Garnet Insight by sharing usage data.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Privacy Policy')).not.toBeInTheDocument()
  })

  it('should render disabled switch when consent is disabled', () => {
    const disabledConsent = {
      ...mockConsent,
      disabled: true,
    }

    render(<ConsentOption {...defaultProps} consent={disabledConsent} />)

    const switchElement = screen.getByTestId('switch-option-analytics')
    expect(switchElement).toBeDisabled()
  })

  it('should render checked switch when checked prop is true', () => {
    render(<ConsentOption {...defaultProps} checked />)

    const switchElement = screen.getByTestId('switch-option-analytics')
    expect(switchElement).toBeChecked()
  })
})
