import React from 'react'
import reactRouterDom from 'react-router-dom'
import { cloneDeep } from 'lodash'
import {
  fireEvent,
  mockedStore,
  render,
  screen,
  waitFor,
} from 'uiSrc/utils/test-utils'
import { Pages } from 'uiSrc/constants'
import { azureAuthAccountSelector } from 'uiSrc/slices/oauth/azure'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { createInstanceStandaloneAction } from 'uiSrc/slices/instances/instances'
import { AzureAccountFactory } from 'uiSrc/mocks/factories/cloud/AzureAccount.factory'

import AzureManualConnectionPage from './AzureManualConnectionPage'

jest.mock('uiSrc/slices/oauth/azure', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/azure'),
  azureAuthAccountSelector: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  createInstanceStandaloneAction: jest
    .fn()
    .mockImplementation((_payload, _onFail, onSuccess) => {
      // Call onSuccess callback to simulate successful database creation
      if (onSuccess) {
        onSuccess()
      }
      return { type: 'createInstanceStandaloneAction' }
    }),
}))

const mockAccount = AzureAccountFactory.build()
const mockedAzureAuthAccountSelector = azureAuthAccountSelector as jest.Mock
const mockedSendEventTelemetry = sendEventTelemetry as jest.Mock
const mockedCreateInstanceStandaloneAction =
  createInstanceStandaloneAction as jest.Mock

let store: typeof mockedStore

describe('AzureManualConnectionPage', () => {
  beforeEach(() => {
    store = cloneDeep(mockedStore)
    store.clearActions()
    mockedAzureAuthAccountSelector.mockReturnValue(mockAccount)
    mockedSendEventTelemetry.mockClear()
    mockedCreateInstanceStandaloneAction.mockClear()
  })

  it('should render', () => {
    expect(render(<AzureManualConnectionPage />, { store })).toBeTruthy()
  })

  it('should redirect to home when not authenticated', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    mockedAzureAuthAccountSelector.mockReturnValue(null)

    render(<AzureManualConnectionPage />, { store })

    expect(pushMock).toHaveBeenCalledWith(Pages.home)
  })

  it('should send telemetry when page is opened', () => {
    render(<AzureManualConnectionPage />, { store })

    expect(mockedSendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.AZURE_MANUAL_CONNECTION_OPENED,
    })
  })

  it('should render form with correct initial values', () => {
    render(<AzureManualConnectionPage />, { store })

    expect(screen.getByTestId('azure-manual-form')).toBeInTheDocument()
    expect(screen.getByTestId('port')).toHaveValue('6380')
    expect(screen.getByTestId('username')).toHaveValue(mockAccount.username)
  })

  describe('navigation', () => {
    it('should navigate to home on cancel', () => {
      const pushMock = jest.fn()
      reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

      render(<AzureManualConnectionPage />, { store })

      fireEvent.click(screen.getByTestId('btn-cancel'))

      expect(pushMock).toHaveBeenCalledWith(Pages.home)
    })

    it('should navigate to azure databases on back button click', () => {
      const pushMock = jest.fn()
      reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

      render(<AzureManualConnectionPage />, { store })

      fireEvent.click(screen.getByTestId('btn-back-adding'))

      expect(pushMock).toHaveBeenCalledWith(Pages.azureDatabases)
    })
  })

  describe('form submission', () => {
    const fillForm = () => {
      fireEvent.change(screen.getByTestId('name'), {
        target: { value: 'Test Azure Redis' },
      })
      fireEvent.change(screen.getByTestId('host'), {
        target: { value: 'myredis.redis.cache.windows.net' },
      })
    }

    it('should not submit when required fields are empty', () => {
      render(<AzureManualConnectionPage />, { store })

      fireEvent.click(screen.getByTestId('btn-submit'))

      expect(mockedCreateInstanceStandaloneAction).not.toHaveBeenCalled()
    })

    it('should send telemetry on form submission', async () => {
      render(<AzureManualConnectionPage />, { store })

      fillForm()
      fireEvent.click(screen.getByTestId('btn-submit'))

      await waitFor(() => {
        expect(mockedSendEventTelemetry).toHaveBeenCalledWith({
          event: TelemetryEvent.AZURE_MANUAL_CONNECTION_SUBMITTED,
          eventData: {
            useSni: false,
            verifyServerCert: true,
          },
        })
      })
    })

    it('should call createInstanceStandaloneAction on valid submission', async () => {
      render(<AzureManualConnectionPage />, { store })

      fillForm()
      fireEvent.click(screen.getByTestId('btn-submit'))

      await waitFor(() => {
        expect(mockedCreateInstanceStandaloneAction).toHaveBeenCalled()
      })
    })

    it('should send success telemetry when database is added successfully', async () => {
      render(<AzureManualConnectionPage />, { store })

      fillForm()
      fireEvent.click(screen.getByTestId('btn-submit'))

      await waitFor(() => {
        expect(mockedSendEventTelemetry).toHaveBeenCalledWith({
          event: TelemetryEvent.AZURE_MANUAL_CONNECTION_SUCCEEDED,
          eventData: {
            useSni: false,
            verifyServerCert: true,
          },
        })
      })
    })
  })
})
