import React from 'react'
import { faker } from '@faker-js/faker'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { AzureRedisDatabase, AzureRedisType } from 'uiSrc/slices/interfaces'
import AzureDatabases, { Props } from './AzureDatabases'

const mockDatabase = (): AzureRedisDatabase => ({
  id: faker.string.uuid(),
  name: faker.internet.domainWord(),
  host: faker.internet.domainName(),
  port: 6379,
  type: AzureRedisType.Standard,
  location: faker.location.city(),
  provisioningState: 'Succeeded',
  resourceGroup: faker.string.alphanumeric(10),
  subscriptionId: faker.string.uuid(),
})

describe('AzureDatabases', () => {
  const defaultProps: Props = {
    databases: [],
    selectedDatabases: [],
    subscriptionName: 'Test Subscription',
    loading: false,
    error: '',
    onBack: jest.fn(),
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    onSelectionChange: jest.fn(),
    onRefresh: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<Props>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<AzureDatabases {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render title', () => {
    renderComponent()
    expect(screen.getByText('Azure Redis Databases')).toBeInTheDocument()
  })

  it('should render subscription name', () => {
    renderComponent({ subscriptionName: 'My Azure Subscription' })
    expect(screen.getByText('Subscription:')).toBeInTheDocument()
    expect(screen.getByText('My Azure Subscription')).toBeInTheDocument()
  })

  it('should render databases in table', () => {
    const databases = [mockDatabase(), mockDatabase()]
    renderComponent({ databases })

    expect(screen.getByText(databases[0].name)).toBeInTheDocument()
    expect(screen.getByText(databases[1].name)).toBeInTheDocument()
  })

  it('should render empty state when no databases', () => {
    renderComponent({ databases: [] })
    expect(
      screen.getByText('No Redis databases found in this subscription.'),
    ).toBeInTheDocument()
  })

  it('should render error message when error is provided', () => {
    const errorMessage = 'Failed to fetch databases'
    renderComponent({ databases: [], error: errorMessage })
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should render loader when loading', () => {
    renderComponent({ loading: true })
    expect(screen.getByTestId('azure-databases-loader')).toBeInTheDocument()
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

  it('should have disabled submit button when no databases are selected', () => {
    const databases = [mockDatabase()]
    renderComponent({ databases, selectedDatabases: [] })

    const submitButton = screen.getByTestId('btn-submit')
    expect(submitButton).toBeDisabled()
  })

  it('should have disabled submit button when loading', () => {
    const databases = [mockDatabase()]
    renderComponent({ databases, selectedDatabases: databases, loading: true })

    const submitButton = screen.getByTestId('btn-submit')
    expect(submitButton).toBeDisabled()
  })

  it('should show count in submit button when databases are selected', () => {
    const databases = [mockDatabase(), mockDatabase()]
    renderComponent({ databases, selectedDatabases: databases })

    expect(screen.getByText(/Add \(2\) Databases/i)).toBeInTheDocument()
  })

  it('should show singular "Database" when one database is selected', () => {
    const databases = [mockDatabase()]
    renderComponent({ databases, selectedDatabases: databases })

    expect(screen.getByText(/Add \(1\) Database$/i)).toBeInTheDocument()
  })

  it('should filter databases when searching', () => {
    const databases = [
      { ...mockDatabase(), name: 'production-redis' },
      { ...mockDatabase(), name: 'development-redis' },
    ]
    renderComponent({ databases })

    const searchInput = screen.getByTestId('search')
    fireEvent.change(searchInput, { target: { value: 'production' } })

    expect(screen.getByText('production-redis')).toBeInTheDocument()
    expect(screen.queryByText('development-redis')).not.toBeInTheDocument()
  })

  it('should preserve search filter when loading state changes', () => {
    const databases = [
      { ...mockDatabase(), name: 'production-redis' },
      { ...mockDatabase(), name: 'development-redis' },
    ]
    const { rerender } = renderComponent({ databases, loading: false })

    // Filter the list
    const searchInput = screen.getByTestId('search')
    fireEvent.change(searchInput, { target: { value: 'production' } })
    expect(screen.queryByText('development-redis')).not.toBeInTheDocument()

    // Rerender with loading=true - filter should still be applied
    rerender(<AzureDatabases {...defaultProps} databases={databases} loading />)
    expect(screen.queryByText('development-redis')).not.toBeInTheDocument()
  })

  it('should call onSubmit when submit button is clicked', () => {
    const databases = [mockDatabase()]
    const onSubmit = jest.fn()
    renderComponent({ databases, selectedDatabases: databases, onSubmit })

    fireEvent.click(screen.getByTestId('btn-submit'))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('should call onRefresh when refresh button is clicked', () => {
    const onRefresh = jest.fn()
    renderComponent({ onRefresh })

    fireEvent.click(screen.getByTestId('btn-refresh-databases'))
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('should have disabled refresh button when loading', () => {
    renderComponent({ loading: true })

    const refreshButton = screen.getByTestId('btn-refresh-databases')
    expect(refreshButton).toBeDisabled()
  })

  it('should sync rowSelection with selectedDatabases prop changes', () => {
    const databases = [mockDatabase(), mockDatabase()]
    const { rerender } = render(
      <AzureDatabases
        {...defaultProps}
        databases={databases}
        selectedDatabases={databases}
      />,
    )

    // Initially both databases are selected, so max message should not show
    expect(
      screen.queryByTestId('max-selection-message'),
    ).not.toBeInTheDocument()

    // Simulate parent resetting selectedDatabases (e.g., on refresh)
    rerender(
      <AzureDatabases
        {...defaultProps}
        databases={databases}
        selectedDatabases={[]}
      />,
    )

    // After reset, no databases should be selected
    expect(
      screen.queryByTestId('max-selection-message'),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/Add Database/)).toBeInTheDocument()
  })

  it('should show max selection message when 10 databases are selected', () => {
    // Use exactly 10 databases so pagination doesn't kick in (pagination at > 10)
    const databases = Array.from({ length: 10 }, () => mockDatabase())
    renderComponent({ databases })

    // Select all 10 databases by clicking on their rows
    databases.forEach((db) => {
      fireEvent.click(screen.getByText(db.name))
    })

    expect(screen.getByTestId('max-selection-message')).toBeInTheDocument()
    expect(
      screen.getByText(/Maximum of 10 databases can be added at a time/),
    ).toBeInTheDocument()
  })

  it('should not show max selection message when less than 10 databases are selected', () => {
    const databases = Array.from({ length: 10 }, () => mockDatabase())
    renderComponent({ databases })

    // Select only 5 databases
    databases.slice(0, 5).forEach((db) => {
      fireEvent.click(screen.getByText(db.name))
    })

    expect(
      screen.queryByTestId('max-selection-message'),
    ).not.toBeInTheDocument()
  })

  it('should not allow selecting more than 10 databases', () => {
    // Use exactly 10 databases so pagination doesn't kick in
    const databases = Array.from({ length: 10 }, () => mockDatabase())
    const onSelectionChange = jest.fn()
    renderComponent({ databases, onSelectionChange })

    // Select all 10 databases
    databases.forEach((db) => {
      fireEvent.click(screen.getByText(db.name))
    })

    // Verify 10 databases were selected
    const lastCall = onSelectionChange.mock.calls.at(-1)?.[0]
    expect(lastCall?.length).toBe(10)

    // Clicking an already selected database should deselect it
    fireEvent.click(screen.getByText(databases[0].name))
    const afterDeselect = onSelectionChange.mock.calls.at(-1)?.[0]
    expect(afterDeselect?.length).toBe(9)
  })
})
