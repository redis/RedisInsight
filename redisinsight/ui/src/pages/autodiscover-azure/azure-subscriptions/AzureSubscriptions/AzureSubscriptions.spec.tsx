import React from 'react'
import { faker } from '@faker-js/faker'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { AzureSubscription } from 'uiSrc/slices/interfaces'
import AzureSubscriptions, { Props } from './AzureSubscriptions'

jest.mock('uiSrc/slices/oauth/azure', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/azure'),
  azureAuthAccountSelector: jest.fn().mockReturnValue({
    id: 'test-account-id',
    username: 'test@example.com',
    name: 'Test User',
  }),
}))

const mockSubscription = (): AzureSubscription => ({
  subscriptionId: faker.string.uuid(),
  displayName: faker.company.name(),
  state: 'Enabled',
  tenantId: faker.string.uuid(),
})

describe('AzureSubscriptions', () => {
  const defaultProps: Props = {
    subscriptions: [],
    loading: false,
    error: '',
    onBack: jest.fn(),
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    onSwitchAccount: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<Props>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<AzureSubscriptions {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render title', () => {
    renderComponent()
    expect(screen.getByText('Azure Subscriptions')).toBeInTheDocument()
  })

  it('should render signed in user', () => {
    renderComponent()
    expect(screen.getByText('Signed in as')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should call onSwitchAccount when switch account button is clicked', () => {
    const onSwitchAccount = jest.fn()
    renderComponent({ onSwitchAccount })

    fireEvent.click(screen.getByTestId('btn-switch-account'))
    expect(onSwitchAccount).toHaveBeenCalledTimes(1)
  })

  it('should render subscriptions in table', () => {
    const subscriptions = [mockSubscription(), mockSubscription()]
    renderComponent({ subscriptions })

    expect(screen.getByText(subscriptions[0].displayName)).toBeInTheDocument()
    expect(screen.getByText(subscriptions[1].displayName)).toBeInTheDocument()
  })

  it('should render empty state when no subscriptions', () => {
    renderComponent({ subscriptions: [] })
    expect(
      screen.getByText('No Azure subscriptions found for this account.'),
    ).toBeInTheDocument()
  })

  it('should render error message when error is provided', () => {
    const errorMessage = 'Failed to fetch subscriptions'
    renderComponent({ subscriptions: [], error: errorMessage })
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should render loader when loading', () => {
    renderComponent({ loading: true })
    expect(screen.getByTestId('azure-subscriptions-loader')).toBeInTheDocument()
  })

  it('should call onBack when back button is clicked', () => {
    const onBack = jest.fn()
    renderComponent({ onBack })

    fireEvent.click(screen.getByTestId('btn-back-adding'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when cancel button is clicked', () => {
    const onClose = jest.fn()
    renderComponent({ onClose })

    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should have disabled submit button when no subscription is selected', () => {
    const subscriptions = [mockSubscription()]
    renderComponent({ subscriptions })

    const submitButton = screen.getByText('Show Databases')
    expect(submitButton).toBeDisabled()
  })

  it('should have disabled submit button when loading', () => {
    const subscriptions = [mockSubscription()]
    renderComponent({ subscriptions, loading: true })

    const submitButton = screen.getByText('Show Databases')
    expect(submitButton).toBeDisabled()
  })

  it('should filter subscriptions when searching', () => {
    const subscriptions = [
      { ...mockSubscription(), displayName: 'Production Subscription' },
      { ...mockSubscription(), displayName: 'Development Subscription' },
    ]
    renderComponent({ subscriptions })

    const searchInput = screen.getByTestId('search')
    fireEvent.change(searchInput, { target: { value: 'Production' } })

    expect(screen.getByText('Production Subscription')).toBeInTheDocument()
    expect(
      screen.queryByText('Development Subscription'),
    ).not.toBeInTheDocument()
  })
})
