import React from 'react'
import { instance, mock } from 'ts-mockito'

import { cloneDeep } from 'lodash'
import {
  ConnectionType,
  Instance,
  OAuthSocialAction,
  OAuthSocialSource,
  RedisCloudSubscriptionType,
} from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import { CREATE_CLOUD_DB_ID } from 'uiSrc/pages/home/constants'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { setSocialDialogState } from 'uiSrc/slices/oauth/cloud'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { MOCK_ADDITIONAL_INFO } from 'uiSrc/mocks/data/instances'
import DatabasesListWrapper, { Props } from './DatabasesListWrapper'

const mockedProps = mock<Props>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSso: {
      flag: true,
    },
    databaseManagement: {
      flag: true,
    },
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

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

/**
 * DatabasesListWrapper tests
 *
 * @group component
 */
describe('DatabasesListWrapper', () => {
  it('should render', () => {
    expect(
      render(
        <DatabasesListWrapper
          {...instance(mockedProps)}
          instances={mockInstances}
        />,
      ),
    ).toBeTruthy()
  })

  it('should show indicator for a new connection', () => {
    const { queryByTestId } = render(
      <DatabasesListWrapper
        {...instance(mockedProps)}
        instances={mockInstances}
      />,
    )

    const dbIdWithNewIndicator = mockInstances.find(
      ({ new: newState }) => newState,
    )?.id
    const dbIdWithoutNewIndicator = mockInstances.find(
      ({ new: newState }) => !newState,
    )?.id

    expect(
      queryByTestId(`database-status-new-${dbIdWithNewIndicator}`),
    ).toBeInTheDocument()
    expect(
      queryByTestId(`database-status-new-${dbIdWithoutNewIndicator}`),
    ).not.toBeInTheDocument()
  })

  it('should render create free cloud row', () => {
    render(
      <DatabasesListWrapper
        {...instance(mockedProps)}
        instances={mockInstances}
        predefinedInstances={
          [{ id: CREATE_CLOUD_DB_ID, name: 'Create free db' }] as Instance[]
        }
      />,
    )

    expect(
      screen.getByTestId(`db-row_${CREATE_CLOUD_DB_ID}`),
    ).toBeInTheDocument()
  })

  it('should call proper action on click cloud db', () => {
    render(
      <DatabasesListWrapper
        {...instance(mockedProps)}
        instances={mockInstances}
        predefinedInstances={
          [{ id: CREATE_CLOUD_DB_ID, name: 'Create free db' }] as Instance[]
        }
      />,
    )

    fireEvent.click(screen.getByTestId(`db-row_${CREATE_CLOUD_DB_ID}`))

    expect(store.getActions()).toEqual([
      setSSOFlow(OAuthSocialAction.Create),
      setSocialDialogState(OAuthSocialSource.DatabaseConnectionList),
    ])
  })

  it('should show link to cloud console', () => {
    render(
      <DatabasesListWrapper
        {...instance(mockedProps)}
        instances={mockInstances}
      />,
    )

    expect(
      screen.queryByTestId(`cloud-link-${mockInstances[0].id}`),
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId(`cloud-link-${mockInstances[1].id}`),
    ).toBeInTheDocument()
  })

  it('should call proper telemetry on click cloud console link', () => {
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

    fireEvent.click(screen.getByTestId(`cloud-link-${mockInstances[1].id}`))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_LINK_CLICKED,
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on open database', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    const { getByTestId } = render(
      <DatabasesListWrapper
        {...instance(mockedProps)}
        instances={mockInstances}
      />,
    )

    await act(() =>
      fireEvent.click(
        getByTestId('instance-name-e37cc441-a4f2-402c-8bdb-fc2413cbbaff'),
      ),
    )
    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
      eventData: {
        databaseId: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
        provider: 'provider',
        source: 'db_list',
        RediSearch: {
          loaded: false,
        },
        RedisAI: {
          loaded: false,
        },
        RedisBloom: {
          loaded: false,
        },
        RedisGears: {
          loaded: false,
        },
        RedisGraph: {
          loaded: false,
        },
        RedisJSON: {
          loaded: false,
        },
        RedisTimeSeries: {
          loaded: false,
        },
        customModules: [],
        ...MOCK_ADDITIONAL_INFO,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should open controls popover when three dots clicked', async () => {
    render(
      <DatabasesListWrapper
        {...instance(mockedProps)}
        instances={mockInstances}
        onEditInstance={() => {}}
      />,
    )

    await act(() => {
      fireEvent.click(
        screen.getByTestId(
          'controls-button-a0db1bc8-a353-4c43-a856-b72f4811d2d4',
        ),
      )
    })

    const controlsPopoverId = screen.getByTestId(
      'controls-popover-a0db1bc8-a353-4c43-a856-b72f4811d2d4',
    )
    const editBtn = screen.getByTestId(
      'edit-instance-a0db1bc8-a353-4c43-a856-b72f4811d2d4',
    )
    const deleteBtn = screen.getByTestId(
      'delete-instance-a0db1bc8-a353-4c43-a856-b72f4811d2d4-icon',
    )

    expect(controlsPopoverId).toBeInTheDocument()
    expect(editBtn).toBeInTheDocument()
    expect(deleteBtn).toBeInTheDocument()
  })

  it('should call proper telemetry on delete database', async () => {
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
      fireEvent.click(
        screen.getByTestId(
          'controls-button-a0db1bc8-a353-4c43-a856-b72f4811d2d4',
        ),
      )
    })

    await act(() => {
      fireEvent.click(
        screen.getByTestId(
          'delete-instance-a0db1bc8-a353-4c43-a856-b72f4811d2d4-icon',
        ),
      )
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_SINGLE_DATABASE_DELETE_CLICKED,
      eventData: {
        databaseId: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on edit database', async () => {
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
      fireEvent.click(
        screen.getByTestId(
          'controls-button-a0db1bc8-a353-4c43-a856-b72f4811d2d4',
        ),
      )
    })

    await act(() => {
      fireEvent.click(
        screen.getByTestId(
          'edit-instance-a0db1bc8-a353-4c43-a856-b72f4811d2d4',
        ),
      )
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_EDIT_CLICKED,
      eventData: {
        databaseId: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should hide management buttons when databaseManagement feature flag is disabled', async () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      databaseManagement: {
        flag: false,
      },
    })

    const { queryByTestId } = render(
      <DatabasesListWrapper
        {...instance(mockedProps)}
        instances={mockInstances}
      />,
    )

    expect(queryByTestId(/^edit-instance-/i)).not.toBeInTheDocument()
    expect(queryByTestId(/^delete-instance-/i)).not.toBeInTheDocument()
    expect(queryByTestId(/^manage-instance-tags-/i)).not.toBeInTheDocument()
  })
})
