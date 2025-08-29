import React from 'react'
import { cleanup, render, screen, userEvent } from 'uiSrc/utils/test-utils'
import { HeaderActions, HeaderActionsProps } from './HeaderActions'

// Workaround for @redis-ui/components Title component issue with react-children-utilities
// TypeError: react_utils.childrenToString is not a function
jest.mock('uiSrc/components/base/layout/drawer', () => ({
  ...jest.requireActual('uiSrc/components/base/layout/drawer'),
  DrawerHeader: jest.fn().mockReturnValue(null),
}))

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockProps: HeaderActionsProps = {
  toggleManageIndexesScreen: jest.fn(),
  toggleSavedQueriesScreen: jest.fn(),
}

const renderComponent = (props = mockProps) =>
  render(<HeaderActions {...props} />)

describe('HeaderActions', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    const { container } = renderComponent()

    expect(container).toBeTruthy()

    const headerActions = screen.getByTestId('vector-search-header-actions')
    expect(headerActions).toBeInTheDocument()

    // Verify the presence of the actions
    const savedQueriesButton = screen.getByText('Saved queries')
    expect(savedQueriesButton).toBeInTheDocument()

    const manageIndexesButton = screen.getByText('Manage indexes')
    expect(manageIndexesButton).toBeInTheDocument()
  })

  it('should call toggleSavedQueriesScreen when "Saved queries" is clicked', async () => {
    const onToggle = jest.fn()
    renderComponent({
      ...mockProps,
      toggleSavedQueriesScreen: onToggle,
    })

    const savedQueriesButton = screen.getByText('Saved queries')
    await userEvent.click(savedQueriesButton)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('should call toggleManageIndexesScreen when "Manage indexes" is clicked', async () => {
    const onToggle = jest.fn()
    renderComponent({
      ...mockProps,
      toggleManageIndexesScreen: onToggle,
    })

    const manageIndexesButton = screen.getByText('Manage indexes')
    await userEvent.click(manageIndexesButton)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
