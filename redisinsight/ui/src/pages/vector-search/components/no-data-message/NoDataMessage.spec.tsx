import React from 'react'
import { cleanup, render, screen } from 'uiSrc/utils/test-utils'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import NoDataMessage, { NoDataMessageProps } from './NoDataMessage'
import { NO_DATA_MESSAGES, NoDataMessageKeys } from './data'
import useRedisInstanceCompatibility from '../../create-index/hooks/useRedisInstanceCompatibility'

jest.mock('../../create-index/hooks/useRedisInstanceCompatibility', () =>
  jest.fn(),
)

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn(),
}))

const mockDefaultNoDataMessageVariant = NoDataMessageKeys.ManageIndexes

const renderNoDataMessageComponent = (props?: NoDataMessageProps) => {
  const defaultProps: NoDataMessageProps = {
    variant: mockDefaultNoDataMessageVariant,
  }

  return render(<NoDataMessage {...defaultProps} {...props} />)
}

describe('NoDataMessage', () => {
  const mockUseRedisInstanceCompatibility =
    useRedisInstanceCompatibility as jest.Mock

  const mockAppFeatureFlagsFeaturesSelector =
    appFeatureFlagsFeaturesSelector as jest.Mock

  beforeEach(() => {
    cleanup()

    mockAppFeatureFlagsFeaturesSelector.mockReturnValue({
      vectorSearch: {
        flag: true,
      },
    })

    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: true,
      hasSupportedVersion: true,
    })
  })

  it('should render correctly', () => {
    renderNoDataMessageComponent()

    const container = screen.getByTestId('no-data-message')
    expect(container).toBeInTheDocument()

    const title = screen.getByText(
      NO_DATA_MESSAGES[mockDefaultNoDataMessageVariant].title,
    )
    const description = screen.queryByText(
      NO_DATA_MESSAGES[mockDefaultNoDataMessageVariant].description,
    )
    const icon = screen.getByAltText(
      NO_DATA_MESSAGES[mockDefaultNoDataMessageVariant].title,
    )
    const gettingStartedButton = screen.queryByRole('button', {
      name: /Get started/i,
    })

    expect(title).toBeInTheDocument()
    expect(description).toBeInTheDocument()
    expect(icon).toBeInTheDocument()
    expect(gettingStartedButton).toBeInTheDocument()
  })

  it('should render without onboarding button and text when ff is off', () => {
    mockAppFeatureFlagsFeaturesSelector.mockReturnValue({
      vectorSearch: {
        flag: false,
      },
    })
    renderNoDataMessageComponent()

    const container = screen.getByTestId('no-data-message')
    expect(container).toBeInTheDocument()

    const title = screen.getByText(
      NO_DATA_MESSAGES[mockDefaultNoDataMessageVariant].title,
    )
    const description = screen.queryByText(
      NO_DATA_MESSAGES[mockDefaultNoDataMessageVariant].description,
    )
    const icon = screen.getByAltText(
      NO_DATA_MESSAGES[mockDefaultNoDataMessageVariant].title,
    )
    const gettingStartedButton = screen.queryByRole('button', {
      name: /Get started/i,
    })

    expect(title).toBeInTheDocument()
    expect(description).not.toBeInTheDocument()
    expect(icon).toBeInTheDocument()
    expect(gettingStartedButton).not.toBeInTheDocument()
  })

  it('should not render "Get started" button when Redis version is unsupported', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: false,
      hasSupportedVersion: false,
    })

    renderNoDataMessageComponent()

    const container = screen.getByTestId('no-data-message')
    expect(container).toBeInTheDocument()

    // Check title and description are rendered
    const title = screen.getByText(
      NO_DATA_MESSAGES[mockDefaultNoDataMessageVariant].title,
    )
    const description = screen.getByText(
      NO_DATA_MESSAGES[mockDefaultNoDataMessageVariant].description,
    )

    expect(title).toBeInTheDocument()
    expect(description).toBeInTheDocument()

    // Check "Get started" button is not rendered, because Redis is older than 7.2
    const button = screen.queryByRole('button', { name: /Get started/i })
    expect(button).not.toBeInTheDocument()
  })
})
