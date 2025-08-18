import React from 'react'
import { cleanup, render, screen, userEvent } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { HeaderActions, HeaderActionsProps } from './HeaderActions'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'

// Workaround for @redis-ui/components Title component issue with react-children-utilities
// TypeError: react_utils.childrenToString is not a function
jest.mock('uiBase/layout', () => {
  const actual = jest.requireActual('uiBase/layout')

  return {
    ...actual,
    RiDrawerHeader: jest.fn().mockReturnValue(null),
  }
})

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockProps: HeaderActionsProps = {
  isManageIndexesDrawerOpen: false,
  setIsManageIndexesDrawerOpen: jest.fn(),
  isSavedQueriesOpen: false,
  setIsSavedQueriesOpen: jest.fn(),
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

  it('should call setIsSavedQueriesOpen when "Saved queries" is clicked', async () => {
    const mockSetIsSavedQueriesOpen = jest.fn()
    renderComponent({
      ...mockProps,
      setIsSavedQueriesOpen: mockSetIsSavedQueriesOpen,
    })

    const savedQueriesButton = screen.getByText('Saved queries')
    await userEvent.click(savedQueriesButton)

    expect(mockSetIsSavedQueriesOpen).toHaveBeenCalledWith(true)

    // Verify telemetry event is sent
    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_OPENED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
      },
    })
  })

  it('should call setIsSavedQueriesOpen with false when "Saved queries" is clicked and isSavedQueriesOpen is true', async () => {
    const mockSetIsSavedQueriesOpen = jest.fn()
    renderComponent({
      ...mockProps,
      isSavedQueriesOpen: true,
      setIsSavedQueriesOpen: mockSetIsSavedQueriesOpen,
    })

    const savedQueriesButton = screen.getByText('Saved queries')
    await userEvent.click(savedQueriesButton)

    expect(mockSetIsSavedQueriesOpen).toHaveBeenCalledWith(false)

    // Verify telemetry event is sent
    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_CLOSED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
      },
    })
  })

  it('should call setIsManageIndexesDrawerOpen when "Manage indexes" is clicked', async () => {
    const mockSetIsManageIndexesDrawerOpen = jest.fn()
    renderComponent({
      ...mockProps,
      setIsManageIndexesDrawerOpen: mockSetIsManageIndexesDrawerOpen,
    })

    const manageIndexesButton = screen.getByText('Manage indexes')
    await userEvent.click(manageIndexesButton)

    expect(mockSetIsManageIndexesDrawerOpen).toHaveBeenCalledWith(true)
  })

  it('should render ManageIndexesDrawer when isManageIndexesDrawerOpen is true', () => {
    renderComponent({
      ...mockProps,
      isManageIndexesDrawerOpen: true,
    })

    const drawer = screen.getByTestId('manage-indexes-drawer')
    expect(drawer).toBeInTheDocument()
  })

  it('should not render ManageIndexesDrawer when isManageIndexesDrawerOpen is false', () => {
    renderComponent({
      ...mockProps,
      isManageIndexesDrawerOpen: false,
    })

    const drawer = screen.queryByTestId('manage-indexes-drawer')
    expect(drawer).not.toBeInTheDocument()
  })
})
