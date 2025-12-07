import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { act } from 'react-dom/test-utils'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Instance, RdiInstance } from 'uiSrc/slices/interfaces'
import InstancesList, { InstancesListProps } from './InstancesList'
import { InstancesTabs } from '../../InstancesNavigationPopover'

const mockedProps = mock<InstancesListProps>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockRdis: RdiInstance[] = [
  {
    id: 'rdiDB_1',
    name: 'RdiDB_1',
    loading: false,
    error: '',
    url: '',
  },
  {
    id: 'rdiDB_2',
    name: 'RdiDB_2',
    loading: false,
    error: '',
    url: '',
  },
]

const mockDbs: Instance[] = [
  {
    id: 'db_1',
    name: 'DB_1',
    host: 'localhost',
    port: 6379,
    modules: [],
    version: '7.0.0',
  },
  {
    id: 'db_2',
    name: 'DB_2',
    host: 'localhost',
    port: 6379,
    modules: [],
    version: '7.0.0',
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

describe('InstancesList', () => {
  it('should render', () => {
    expect(render(<InstancesList {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render database instances when selected tab is db', () => {
    render(
      <InstancesList
        {...instance(mockedProps)}
        selectedTab={InstancesTabs.Databases}
        filteredDbInstances={mockDbs}
      />,
    )

    expect(screen.getByText(mockDbs[0].name!)).toBeInTheDocument()
  })

  it('should render rdi instances when selected tab is rdi', () => {
    render(
      <InstancesList
        {...instance(mockedProps)}
        selectedTab={InstancesTabs.RDI}
        filteredRdiInstances={mockRdis}
      />,
    )
    expect(screen.getByText(mockRdis[0].name)).toBeInTheDocument()
  })

  it('should send event telemetry', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    const { getByTestId } = render(
      <InstancesList
        {...instance(mockedProps)}
        selectedTab={InstancesTabs.Databases}
        filteredDbInstances={mockDbs}
      />,
    )

    const listItem = getByTestId(`instance-item-${mockDbs[1].id}`)
    await act(() => fireEvent.click(listItem))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
      eventData: expect.any(Object),
    })
  })
})
