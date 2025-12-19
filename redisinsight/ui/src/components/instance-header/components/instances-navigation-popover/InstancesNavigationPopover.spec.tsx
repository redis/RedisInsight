import { cloneDeep } from 'lodash'
import React from 'react'
import { act } from 'react-dom/test-utils'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { instancesSelector } from 'uiSrc/slices/rdi/instances'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import InstancesNavigationPopover, {
  InstancesTabs,
} from './InstancesNavigationPopover'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockRdis = [
  {
    id: 'rdiDB_1',
    name: 'RdiDB_1',
  },
  {
    id: 'rdiDB_2',
    name: 'RdiDB_2',
  },
]

const mockDbs = [
  {
    id: 'db_1',
    name: 'DB_1',
  },
  {
    id: 'db_2',
    name: 'DB_2',
  },
]

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  instancesSelector: jest.fn().mockReturnValue({
    data: mockRdis,
    connectedInstance: {
      id: 'rdiDB_1',
      name: 'RdiDB_1',
    },
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  instancesSelector: jest.fn().mockReturnValue({
    data: mockDbs,
    connectedInstance: {
      id: 'db_1',
      name: 'DB_1',
    },
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('InstancesNavigationPopover', () => {
  it('should render', () => {
    expect(render(<InstancesNavigationPopover name="db" />)).toBeTruthy()
  })

  it('should open popover on click', () => {
    render(<InstancesNavigationPopover name="db" />)

    act(() => {
      fireEvent.click(screen.getByTestId('nav-instance-popover-btn'))
    })

    expect(screen.getByTestId('instances-tabs-testId')).toBeInTheDocument()
  })

  it('should filter instances list', () => {
    ;(instancesSelector as jest.Mock).mockReturnValue({
      data: mockRdis,
    })
    render(<InstancesNavigationPopover name="db" />)

    act(() => {
      fireEvent.click(screen.getByTestId('nav-instance-popover-btn'))
    })

    const searchInput = screen.getByTestId('instances-nav-popover-search')

    expect(screen.getByText('RdiDB_2')).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: '_1' } })

    expect(screen.getByText('RdiDB_1')).toBeInTheDocument()
    expect(screen.queryAllByText('RdiDB_2')).toHaveLength(0)
  })

  it('should change tabs on tabs click', () => {
    render(<InstancesNavigationPopover name="db" />)

    fireEvent.click(screen.getByTestId('nav-instance-popover-btn'))
    expect(
      screen.getByText(`${InstancesTabs.Databases} (0)`),
    ).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByText(`${InstancesTabs.RDI} (2)`))
    expect(screen.getByText('Redis Data Integration page')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByText(`${InstancesTabs.Databases} (0)`))
    expect(screen.getByText('Redis Databases page')).toBeInTheDocument()
  })

  it('should send event telemetry', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(<InstancesNavigationPopover name="db" />)

    act(() => {
      fireEvent.click(screen.getByTestId('nav-instance-popover-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.NAVIGATION_PANEL_OPENED,
      eventData: {
        databaseId: 'instanceId',
        numOfRdiDbs: 2,
        numOfRedisDbs: 0,
      },
    })
  })
})
