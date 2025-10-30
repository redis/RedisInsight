import { EuiInMemoryTable } from '@elastic/eui'
import React from 'react'
import { instance, mock } from 'ts-mockito'

import ItemList, {
  Props as ItemListProps,
} from 'uiSrc/components/item-list/ItemList'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import {
  cleanup,
  createMockedStore,
  mockedStore,
  render,
  screen,
  userEvent,
} from 'uiSrc/utils/test-utils'

import {
  setDefaultInstance,
  setDefaultInstanceSuccess,
} from 'uiSrc/slices/rdi/instances'
import RdiInstancesListWrapper, { Props } from './RdiInstancesListWrapper'

const mockedProps = mock<Props>()

jest.mock('uiSrc/components/item-list/ItemList', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}))

const mockInstances: RdiInstance[] = [
  {
    id: '1',
    name: 'My first integration',
    url: 'redis-12345.c253.us-central1-1.gce.cloud.redislabs.com:12345',
    lastConnection: new Date(),
    version: '1.2',
    error: '',
    loading: false,
  },
  {
    id: '2',
    name: 'My second integration',
    url: 'redis-67890.c253.us-central1-1.gce.cloud.redislabs.com:67890',
    lastConnection: new Date(),
    version: '1.3',
    error: '',
    loading: false,
  },
]

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  instancesSelector: jest.fn().mockReturnValue({
    loading: false,
    error: '',
    data: mockInstances,
  }),
}))

const mockRdiInstancesList = (props: ItemListProps<RdiInstance>) => {
  if (!props.columns) {
    return null
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => props.onDelete([mockInstances[1]])}
        data-testid="onDelete-btn"
      >
        onDelete
      </button>
      <button
        type="button"
        onClick={() =>
          props.onTableChange({
            sort: {
              field: 'name',
              direction: 'asc',
            },
          })
        }
        data-testid="onTableChange-btn"
      >
        onTableChange
      </button>
      <div className="itemList">
        <EuiInMemoryTable
          isSelectable
          items={mockInstances}
          itemId="id"
          loading={false}
          columns={props.columns}
          data-testid="table"
        />
      </div>
    </div>
  )
}

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = createMockedStore()
  store.clearActions()
})

const renderRdiInstancesListWrapper = (props: Props) =>
  render(<RdiInstancesListWrapper {...props} />, { store })

describe('RdiInstancesListWrapper', () => {
  beforeAll(() => {
    ;(ItemList as jest.Mock).mockImplementation(mockRdiInstancesList)
  })

  it('should render', () => {
    expect(renderRdiInstancesListWrapper(instance(mockedProps))).toBeTruthy()
  })

  it('should call proper telemetry on delete multiple instances', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    renderRdiInstancesListWrapper(instance(mockedProps))

    await userEvent.click(screen.getByTestId('onDelete-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_INSTANCE_MULTIPLE_DELETE_CLICKED,
      eventData: {
        ids: ['2'],
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper action on rdi alias click', async () => {
    renderRdiInstancesListWrapper(instance(mockedProps))

    await userEvent.click(screen.getByTestId('rdi-alias-1'))

    const expectedActions = [setDefaultInstance(), setDefaultInstanceSuccess()]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper telemetry on copy url', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    renderRdiInstancesListWrapper(instance(mockedProps))

    const copyHostPortButtons = screen.getAllByLabelText(/Copy url/i)
    await userEvent.click(copyHostPortButtons[0])

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_INSTANCE_URL_COPIED,
      eventData: {
        id: '1',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on delete instance', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    renderRdiInstancesListWrapper(instance(mockedProps))

    await userEvent.click(screen.getByTestId('delete-instance-2-icon'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_INSTANCE_SINGLE_DELETE_CLICKED,
      eventData: {
        id: '2',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on list sort', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    renderRdiInstancesListWrapper({
      ...instance(mockedProps),
      onEditInstance: () => {},
    })

    await userEvent.click(screen.getByTestId('onTableChange-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_INSTANCE_LIST_SORTED,
      eventData: { field: 'name', direction: 'asc' },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on instance click', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    renderRdiInstancesListWrapper(instance(mockedProps))

    await userEvent.click(screen.getByTestId('rdi-alias-1'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.OPEN_RDI_CLICKED,
      eventData: {
        rdiId: '1',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
})
