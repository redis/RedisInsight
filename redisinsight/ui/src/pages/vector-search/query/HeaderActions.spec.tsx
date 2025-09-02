import React from 'react'
import { cleanup, render, screen, userEvent } from 'uiSrc/utils/test-utils'
import { HeaderActions, HeaderActionsProps } from './HeaderActions'
import useRedisInstanceCompatibility from '../create-index/hooks/useRedisInstanceCompatibility'

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

jest.mock('../create-index/hooks/useRedisInstanceCompatibility', () =>
  jest.fn(),
)

const mockProps: HeaderActionsProps = {
  toggleManageIndexesScreen: jest.fn(),
  toggleSavedQueriesScreen: jest.fn(),
}

const renderComponent = (props = mockProps) =>
  render(<HeaderActions {...props} />)

describe('HeaderActions', () => {
  const mockUseRedisInstanceCompatibility =
    useRedisInstanceCompatibility as jest.Mock

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()

    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: true,
      hasSupportedVersion: true,
    })
  })

  afterEach(() => {
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

  it('should render "start wizard banner" when RQE and Vector sets are supported', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: false,
      hasSupportedVersion: true,
    })

    renderComponent({
      ...mockProps,
    })

    const startWizardButton = screen.getByTestId('start-wizard-button')
    expect(startWizardButton).toBeInTheDocument()
  })

  it('should render "free redis cloud db" banner when vector sets are not supported', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: true,
      hasSupportedVersion: false,
    })

    renderComponent({
      ...mockProps,
    })

    const vectorSetNotAvailableBanner = screen.getByTestId(
      'vector-set-not-available-banner',
    )
    expect(vectorSetNotAvailableBanner).toBeInTheDocument()
  })

  it('should not render "start wizard banner" and "free redis cloud db" banner when loading', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: true,
      hasRedisearch: true,
      hasSupportedVersion: true,
    })

    renderComponent({
      ...mockProps,
    })

    const startWizardButton = screen.queryByTestId('start-wizard-button')
    const vectorSetNotAvailableBanner = screen.queryByTestId(
      'vector-set-not-available-banner',
    )

    expect(startWizardButton).not.toBeInTheDocument()
    expect(vectorSetNotAvailableBanner).not.toBeInTheDocument()
  })
})
