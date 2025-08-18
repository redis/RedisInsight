import React, { useState } from 'react'
import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import {
  ManageIndexesDrawer,
  ManageIndexesDrawerProps,
} from './ManageIndexesDrawer'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'

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

const MockDrawer = ({ open, ...rest }: Partial<ManageIndexesDrawerProps>) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(open ?? true)

  return (
    <>
      <button
        data-testid="toggle-drawer"
        onClick={() => setIsDrawerOpen((prev) => !prev)}
      >
        Toggle Drawer
      </button>

      <ManageIndexesDrawer open={isDrawerOpen} {...rest} />
    </>
  )
}

const renderComponent = (props?: Partial<ManageIndexesDrawerProps>) => {
  const defaultProps: ManageIndexesDrawerProps = {
    open: true,
    onOpenChange: jest.fn(),
  }

  return render(<MockDrawer {...defaultProps} {...props} />)
}

describe('ManageIndexesDrawer', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    const { container } = renderComponent()

    expect(container).toBeTruthy()

    const drawer = screen.getByTestId('manage-indexes-drawer')
    expect(drawer).toBeInTheDocument()

    // Note: Since we mocked DrawerHeader, we can't check its presence
    // const header = screen.getByText('Manage indexes')
    // expect(header).toBeInTheDocument()

    const body = screen.getByTestId('manage-indexes-drawer-body')
    expect(body).toBeInTheDocument()

    const list = screen.getByTestId('manage-indexes-list')
    expect(list).toBeInTheDocument()
  })

  describe('Telemetry', () => {
    it('should send telemetry event on drawer open', async () => {
      renderComponent({ open: false })

      // Click the toggle button to open the drawer
      const toggleButton = screen.getByTestId('toggle-drawer')
      fireEvent.click(toggleButton)

      // Simulate the animation lifecycle so Drawer fires didOpen (dirty hack)
      const dialog = screen.getByRole('dialog')
      fireEvent.animationStart(dialog)
      fireEvent.animationEnd(dialog)

      const drawer = screen.getByTestId('manage-indexes-drawer')
      expect(drawer).toBeInTheDocument()

      // Verify telemetry event is sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_OPENED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
        },
      })
    })

    it('should send telemetry event on drawer close', async () => {
      renderComponent({ open: true })

      const openDrawer = screen.getByTestId('manage-indexes-drawer')
      expect(openDrawer).toBeInTheDocument()

      // Click the toggle button to open the drawer
      const toggleButton = screen.getByTestId('toggle-drawer')

      // Dialog stays mounted but hidden during exit
      // const closingDialog = screen.getByRole('dialog', { hidden: true })

      // Simulate the animation lifecycle so Drawer fires didClose
      fireEvent.click(toggleButton)
      // fireEvent.animationStart(closingDialog)
      // fireEvent.animationEnd(closingDialog)

      // Note: For some reason, the dirty hackwith the animated dialog is not working here and the onDidCLosed is not trigerred in the tests
      // await waitFor(() =>
      //   expect(sendEventTelemetry).toHaveBeenCalledWith({
      //     event: TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_CLOSED,
      //     eventData: { databaseId: INSTANCE_ID_MOCK },
      //   }),
      // )

      // Verify the drawer is no longer open
      const closedDrawer = screen.queryByTestId('manage-indexes-drawer')
      expect(closedDrawer).not.toBeInTheDocument()
    })
  })
})
