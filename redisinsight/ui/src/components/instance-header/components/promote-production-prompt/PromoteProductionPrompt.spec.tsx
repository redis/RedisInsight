import React from 'react'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import { Environment } from 'apiClient'

import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { localStorageService } from 'uiSrc/services'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { BrowserStorageItem, Pages } from 'uiSrc/constants'
import {
  ConnectionType,
  EditDatabaseField,
  Instance,
} from 'uiSrc/slices/interfaces'
import { DBInstanceFactory } from 'uiSrc/mocks/factories/database/DBInstance.factory'
import {
  connectedInstanceOverviewSelector,
  connectedInstanceSelector,
  instancesSelector,
} from 'uiSrc/slices/instances/instances'
import { appFeatureFlagProdModeSelector } from 'uiSrc/slices/app/features'
import { PromoteProductionPrompt } from './PromoteProductionPrompt'

const mockHistoryPush = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ push: jest.fn }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    get: jest.fn(),
    set: jest.fn(),
  },
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagProdModeSelector: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn(),
  connectedInstanceOverviewSelector: jest.fn(),
  instancesSelector: jest.fn(),
}))

const mockSendEventTelemetry = jest.mocked(sendEventTelemetry)
const mockLocalStorageGet = jest.mocked(localStorageService.get)
const mockLocalStorageSet = jest.mocked(localStorageService.set)
const mockProdModeSelector = jest.mocked(appFeatureFlagProdModeSelector)
const mockConnectedInstanceSelector = jest.mocked(connectedInstanceSelector)
const mockOverviewSelector = jest.mocked(connectedInstanceOverviewSelector)
const mockInstancesSelector = jest.mocked(instancesSelector)

const DATABASE_ID = 'db-1'

const buildProductionLikeInstance = () =>
  DBInstanceFactory.build({
    id: DATABASE_ID,
    environment: Environment.Unspecified,
    host: 'redis.prod.example.com',
    tls: true,
    connectionType: ConnectionType.Standalone,
    username: null,
  })

let store: typeof mockedStore

interface MockOptions {
  prodMode?: boolean
  connectedInstance?: Instance
  instances?: Instance[]
  totalKeys?: number
  actioned?: boolean
}

const setMocks = ({
  prodMode = true,
  connectedInstance = buildProductionLikeInstance(),
  instances,
  totalKeys = 50_000,
  actioned = false,
}: MockOptions = {}) => {
  mockProdModeSelector.mockReturnValue(prodMode)
  mockConnectedInstanceSelector.mockReturnValue(connectedInstance)
  mockOverviewSelector.mockReturnValue({ version: '', totalKeys })
  mockInstancesSelector.mockReturnValue({
    data: instances ?? [connectedInstance],
  } as ReturnType<typeof instancesSelector>)
  mockLocalStorageGet.mockReturnValue(actioned)
}

const renderComponent = () => render(<PromoteProductionPrompt />, { store })

beforeEach(() => {
  cleanup()
  jest.clearAllMocks()
  store = cloneDeep(mockedStore)
  store.clearActions()
  setMocks()
  reactRouterDom.useHistory = jest
    .fn()
    .mockReturnValue({ push: mockHistoryPush })
})

describe('PromoteProductionPrompt', () => {
  it('shows the prompt and fires the displayed event for a likely-production database', async () => {
    renderComponent()

    expect(
      await screen.findByTestId('promote-production-confirm'),
    ).toBeInTheDocument()
    expect(mockSendEventTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        event: TelemetryEvent.PROD_MODE_PROMOTION_PROMPT_DISPLAYED,
        eventData: expect.objectContaining({
          databaseId: DATABASE_ID,
          totalKeys: 50_000,
          hasKeyCountSignal: true,
          isRemoteHost: true,
          hasTls: true,
        }),
      }),
    )
  })

  it('does not render when the prodMode flag is disabled', () => {
    setMocks({ prodMode: false })
    renderComponent()

    expect(
      screen.queryByTestId('promote-production-prompt'),
    ).not.toBeInTheDocument()
  })

  it('does not render when the prompt was already actioned', () => {
    setMocks({ actioned: true })
    renderComponent()

    expect(
      screen.queryByTestId('promote-production-prompt'),
    ).not.toBeInTheDocument()
  })

  it('does not render for an already-classified connected database', () => {
    setMocks({
      connectedInstance: DBInstanceFactory.build({
        id: DATABASE_ID,
        environment: Environment.Production,
      }),
    })
    renderComponent()

    expect(
      screen.queryByTestId('promote-production-prompt'),
    ).not.toBeInTheDocument()
  })

  it('does not render once the feature is discovered (another database is classified)', () => {
    const connectedInstance = buildProductionLikeInstance()
    setMocks({
      connectedInstance,
      instances: [
        connectedInstance,
        DBInstanceFactory.build({ environment: Environment.Development }),
      ],
    })
    renderComponent()

    expect(
      screen.queryByTestId('promote-production-prompt'),
    ).not.toBeInTheDocument()
  })

  it('does not render until the database list has loaded', () => {
    setMocks({ instances: [] })
    renderComponent()

    expect(
      screen.queryByTestId('promote-production-prompt'),
    ).not.toBeInTheDocument()
  })

  it('does not render for a Sentinel connection (no Environment field to set)', () => {
    setMocks({
      connectedInstance: DBInstanceFactory.build({
        id: DATABASE_ID,
        environment: Environment.Unspecified,
        host: 'redis.prod.example.com',
        tls: true,
        connectionType: ConnectionType.Sentinel,
      }),
    })
    renderComponent()

    expect(
      screen.queryByTestId('promote-production-prompt'),
    ).not.toBeInTheDocument()
  })

  it('does not render for a local database that does not look like production', () => {
    setMocks({
      connectedInstance: DBInstanceFactory.build({
        id: DATABASE_ID,
        environment: Environment.Unspecified,
        host: 'localhost',
        tls: false,
        connectionType: ConnectionType.Standalone,
        username: null,
      }),
      totalKeys: 5,
    })
    renderComponent()

    expect(
      screen.queryByTestId('promote-production-prompt'),
    ).not.toBeInTheDocument()
  })

  it('persists the actioned flag and reports telemetry on "Not now"', async () => {
    renderComponent()

    fireEvent.click(await screen.findByTestId('promote-production-not-now'))

    expect(mockLocalStorageSet).toHaveBeenCalledWith(
      BrowserStorageItem.prodModeCtaActioned,
      true,
    )
    expect(mockSendEventTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        event: TelemetryEvent.PROD_MODE_PROMOTION_PROMPT_NOT_NOW_CLICKED,
        eventData: { databaseId: DATABASE_ID },
      }),
    )
    expect(mockHistoryPush).not.toHaveBeenCalled()
  })

  it('navigates to the edit-form deep link on confirm', async () => {
    renderComponent()

    fireEvent.click(await screen.findByTestId('promote-production-confirm'))

    expect(mockLocalStorageSet).toHaveBeenCalledWith(
      BrowserStorageItem.prodModeCtaActioned,
      true,
    )
    expect(mockSendEventTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        event:
          TelemetryEvent.PROD_MODE_PROMOTION_PROMPT_MARK_AS_PRODUCTION_CLICKED,
        eventData: { databaseId: DATABASE_ID },
      }),
    )
    expect(mockHistoryPush).toHaveBeenCalledWith(
      Pages.homeEditInstance(DATABASE_ID, EditDatabaseField.Environment),
    )
  })
})
