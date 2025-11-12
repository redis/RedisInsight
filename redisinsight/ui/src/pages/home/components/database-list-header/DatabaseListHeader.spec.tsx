import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'

import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { ConnectionType, Instance, OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { DatabaseListColumn } from 'uiSrc/constants'
import { instancesSelector, setShownColumns } from 'uiSrc/slices/instances/instances'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { setSocialDialogState } from 'uiSrc/slices/oauth/cloud'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { CREATE_CLOUD_DB_ID } from 'uiSrc/pages/home/constants'

import DatabaseListHeader, { Props } from './DatabaseListHeader'

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
    provider: 'provider'
  }
]

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    enhancedCloudUI: {
      flag: false,
    },
    databaseManagement: {
      flag: true,
    },
    cloudAds: {
      flag: true,
    },
  }),
}))

const mockShownColumns: DatabaseListColumn[] = [
  DatabaseListColumn.Name,
  DatabaseListColumn.Host,
  DatabaseListColumn.Controls,
]

const mockHiddenColumns: DatabaseListColumn[] = [
  DatabaseListColumn.ConnectionType,
  DatabaseListColumn.Modules,
  DatabaseListColumn.LastConnection,
]

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  instancesSelector: jest.fn().mockReturnValue({
    loading: false,
    shownColumns: ['name', 'host', 'controls'],
    data: [...mockInstances],
  }),
}))

jest.mock('uiSrc/slices/content/create-redis-buttons', () => ({
  ...jest.requireActual('uiSrc/slices/content/create-redis-buttons'),
  contentSelector: jest.fn().mockReturnValue({
    data: {
      cloud: {
        title: 'Try Redis Cloud: your ultimate Redis starting point',
        description:
          'Includes native support for JSON, Search and Query, and more',
        links: {
          main: {
            altText: 'Try Redis Cloud.',
            url: 'https://redis.io/try-free/?utm_source=redisinsight&utm_medium=main&utm_campaign=main',
          },
        },
      },
    },
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions();

  (instancesSelector as jest.Mock).mockReturnValue({
    loading: false,
    shownColumns: ['name', 'host', 'controls'],
    data: [...mockInstances],
  })
})

describe('DatabaseListHeader', () => {
  it('should render', () => {
    expect(
      render(<DatabaseListHeader {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should not show promo cloud button with disabled feature flag', () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValueOnce({
      enhancedCloudUI: {
        flag: true,
      },
    })

    render(<DatabaseListHeader {...instance(mockedProps)} />)

    expect(screen.queryByTestId('promo-btn')).not.toBeInTheDocument()
  })

  it('should show promo cloud button with enabled feature flag', () => {
    render(<DatabaseListHeader {...instance(mockedProps)} />)

    expect(screen.getByTestId('promo-btn')).toBeInTheDocument()
  })

  it('should show "create database" button when database management feature flag is enabled', () => {
    const { queryByTestId } = render(
      <DatabaseListHeader {...instance(mockedProps)} />,
    )

    expect(queryByTestId('add-redis-database-short')).toBeInTheDocument()
  })

  it('should hide "create database" button when database management feature flag is disabled', () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      databaseManagement: {
        flag: false,
      },
    })

    const { queryByTestId } = render(
      <DatabaseListHeader {...instance(mockedProps)} />,
    )

    expect(queryByTestId('add-redis-database-short')).not.toBeInTheDocument()
  })

  it('should show checkboxes with the right checked state when columns config button is clicked', async () => {
    render(<DatabaseListHeader {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('btn-columns-config'))

    const popover = await screen.findByTestId('columns-config-popover')
    expect(popover).toBeInTheDocument()

    mockShownColumns.forEach(column => {
      const checkbox = screen.getByTestId(`show-${column}`)
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toBeChecked()
    })

    mockHiddenColumns.forEach(column => {
      const checkbox = screen.getByTestId(`show-${column}`)
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
    })
  })

  it('should dispatch setShownColumns action when checkbox clicked', async () => {
    render(<DatabaseListHeader {...instance(mockedProps)} />)
    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('btn-columns-config'))

    const popover = await screen.findByTestId('columns-config-popover')
    expect(popover).toBeInTheDocument()

    const checkbox = screen.getByTestId('show-name')
    expect(checkbox).toBeInTheDocument()

    fireEvent.click(checkbox)

    const expectedActions = [setShownColumns(['host', 'controls'])]
    expect(store.getActions()).toEqual([...afterRenderActions, ...expectedActions])
  })

  it('should log telemetry event when columns config changed', async () => {
    const sendEventTelemetryMock = sendEventTelemetry as jest.Mock

    render(<DatabaseListHeader {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('btn-columns-config'))

    const popover = await screen.findByTestId('columns-config-popover')
    expect(popover).toBeInTheDocument()

    const checkbox = screen.getByTestId('show-host')
    expect(checkbox).toBeInTheDocument()

    // clicking this checkbox will hide the column
    fireEvent.click(checkbox)

    expect(sendEventTelemetryMock).toBeCalledWith({
      event: TelemetryEvent.DATABASE_LIST_COLUMNS_CLICKED,
      eventData: {
        shown: [],
        hidden: [
          DatabaseListColumn.Host,
        ]
      },
    })
  })

  it('should dispatch SSO actions when clicking Create Free Cloud DB header button', () => {
    const featureMock = appFeatureFlagsFeaturesSelector as jest.Mock

    // Ensure the header button is visible and SSO path is taken
    featureMock.mockReturnValue({
      enhancedCloudUI: { flag: true },
      cloudAds: { flag: true },
      cloudSso: { flag: true },
      databaseManagement: { flag: true },
    })

    render(<DatabaseListHeader {...instance(mockedProps)} />)

    const btn = screen.getByTestId(`${CREATE_CLOUD_DB_ID}-button`)
    expect(btn).toBeInTheDocument()

    fireEvent.click(btn)

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        setSSOFlow(OAuthSocialAction.Create),
        setSocialDialogState(OAuthSocialSource.DatabaseConnectionList),
      ]),
    )

    // Restore default flags for other tests
    featureMock.mockReturnValue({
      enhancedCloudUI: { flag: false },
      databaseManagement: { flag: true },
      cloudAds: { flag: true },
    })
  })

})
