import { EuiInMemoryTable } from '@elastic/eui'
import React from 'react'
import { instance, mock } from 'ts-mockito'

import ItemList, {
  Props as ItemListProps,
} from 'uiSrc/components/item-list/ItemList'
import {
  ConnectionType,
  Instance,
  RedisCloudSubscriptionType,
} from 'uiSrc/slices/interfaces'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { mswServer } from 'uiSrc/mocks/server'
import { errorHandlers } from 'uiSrc/mocks/res/responseComposition'
import DatabasesListWrapper, { Props } from './DatabasesListWrapper'

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

const mockInstances: Instance[] = [
  {
    id: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
    host: 'localhost',
    port: 6379,
    name: 'localhost',
    username: null,
    password: null,
    connectionType: ConnectionType.Standalone,
    nameFromProvider: null,
    new: true,
    modules: [],
    version: null,
    lastConnection: new Date('2021-04-22T09:03:56.917Z'),
    provider: 'provider',
  },
  {
    id: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4',
    host: 'localhost',
    port: 12000,
    name: 'oea123123',
    username: null,
    password: null,
    connectionType: ConnectionType.Standalone,
    nameFromProvider: null,
    tls: true,
    modules: [],
    version: null,
    cloudDetails: {
      cloudId: 1,
      subscriptionType: RedisCloudSubscriptionType.Fixed,
    },
  },
]

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  instancesSelector: jest.fn().mockReturnValue({
    loading: false,
    error: '',
    data: mockInstances,
    shownColumns: ['name', 'host', 'controls'],
  }),
}))

const mockDatabasesList = (props: ItemListProps<Instance>) => {
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
        onClick={() => props.onExport?.([mockInstances[0]], true)}
        data-testid="onExport-btn"
      >
        onExport
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

describe('DatabasesListWrapper', () => {
  beforeAll(() => {
    ;(ItemList as jest.Mock).mockImplementation(mockDatabasesList)
  })

  it('should call proper telemetry on success export', async () => {
    const sendEventTelemetryMock = jest.fn()

    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(
      <DatabasesListWrapper
        {...instance(mockedProps)}
        instances={mockInstances}
      />,
    )

    await act(() => {
      fireEvent.click(screen.getByTestId('onExport-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_SUCCEEDED,
      eventData: {
        numberOfDatabases: 1,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on fail export', async () => {
    mswServer.use(...errorHandlers)
    const sendEventTelemetryMock = jest.fn()

    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(
      <DatabasesListWrapper
        {...instance(mockedProps)}
        instances={mockInstances}
      />,
    )

    await act(() => {
      fireEvent.click(screen.getByTestId('onExport-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_FAILED,
      eventData: {
        numberOfDatabases: 1,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on copy host:port', async () => {
    const sendEventTelemetryMock = jest.fn()

    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(
      <DatabasesListWrapper
        {...instance(mockedProps)}
        instances={mockInstances}
      />,
    )

    await act(() => {
      const copyHostPortButtons = screen.getAllByLabelText(/Copy host:port/i)
      fireEvent.click(copyHostPortButtons[0])
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_HOST_PORT_COPIED,
      eventData: {
        databaseId: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on list sort', async () => {
    const sendEventTelemetryMock = jest.fn()

    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(
      <DatabasesListWrapper
        {...instance(mockedProps)}
        instances={mockInstances}
        onEditInstance={() => {}}
      />,
    )

    await act(() => {
      fireEvent.click(screen.getByTestId('onTableChange-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_LIST_SORTED,
      eventData: { field: 'name', direction: 'asc' },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on delete multiple databases', async () => {
    const sendEventTelemetryMock = jest.fn()

    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(
      <DatabasesListWrapper
        {...instance(mockedProps)}
        instances={mockInstances}
      />,
    )

    await act(() => {
      fireEvent.click(screen.getByTestId('onDelete-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_MULTIPLE_DATABASES_DELETE_CLICKED,
      eventData: {
        ids: ['a0db1bc8-a353-4c43-a856-b72f4811d2d4'],
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
})
