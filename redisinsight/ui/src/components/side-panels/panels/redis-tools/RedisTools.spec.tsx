import React from 'react'
import reactRouterDom from 'react-router-dom'
import { Environment } from 'apiClient'
import { faker } from '@faker-js/faker'

import { act, fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import { ConnectionProvider, ConnectionType } from 'uiSrc/slices/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { exportInstances } from 'uiSrc/services/database/instancesService'

import {
  REDIS_TOOLS_INIT_COMMAND,
  REDIS_TOOLS_PASSWORD_MASK,
} from './RedisTools.constants'
import { RedisTools } from './RedisTools'

const mockInstanceId = faker.string.uuid()

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn(),
}))

jest.mock('uiSrc/services/database/instancesService', () => ({
  ...jest.requireActual('uiSrc/services/database/instancesService'),
  exportInstances: jest.fn(),
}))

describe('RedisTools', () => {
  const databaseName = 'orders-dev'

  const mockConnectedInstance = (
    overrides: Partial<{
      name: string
      host: string
      port: number
      connectionType: ConnectionType
      provider: ConnectionProvider
      environment: Environment
      username: string
      password: true
      id: string
    }> = {},
    instanceId: string | null = mockInstanceId,
  ) => {
    reactRouterDom.useParams = jest
      .fn()
      .mockReturnValue({ instanceId: instanceId ?? undefined })
    ;(connectedInstanceSelector as unknown as jest.Mock).mockReturnValue({
      id: instanceId ?? undefined,
      name: databaseName,
      host: 'localhost',
      port: 6379,
      connectionType: ConnectionType.Standalone,
      provider: ConnectionProvider.REDIS_CLOUD,
      environment: Environment.Development,
      ...overrides,
    })
  }

  const renderComponent = () => render(<RedisTools />)

  beforeEach(() => {
    mockConnectedInstance()
    ;(exportInstances as jest.Mock).mockResolvedValue([{ password: 'secret' }])
  })

  it('should show the connect command by default', () => {
    renderComponent()

    expect(screen.getByTestId('redis-tools-command')).toHaveTextContent(
      `${REDIS_TOOLS_INIT_COMMAND} --cloud --name ${databaseName}`,
    )
  })

  it('should not offer a mode switch', () => {
    renderComponent()

    expect(screen.queryByTestId('redis-tools-mode')).not.toBeInTheDocument()
  })

  it('should drop the database flags when connect is unchecked', () => {
    renderComponent()

    fireEvent.click(screen.getByLabelText(`Connect ${databaseName}`))

    expect(screen.getByTestId('redis-tools-command')).toHaveTextContent(
      REDIS_TOOLS_INIT_COMMAND,
    )
    expect(screen.getByTestId('redis-tools-command')).not.toHaveTextContent(
      '--cloud',
    )
  })

  it('should leave connect unchecked by default for a production database', () => {
    mockConnectedInstance({ environment: Environment.Production })
    renderComponent()

    expect(screen.getByLabelText(`Connect ${databaseName}`)).not.toBeChecked()
    expect(screen.getByTestId('redis-tools-command')).not.toHaveTextContent(
      '--cloud',
    )
  })

  it('should ignore a previously opened database until the new one loads', () => {
    mockConnectedInstance({ id: faker.string.uuid() })
    renderComponent()

    expect(
      screen.queryByTestId('redis-tools-connect-database'),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('redis-tools-command')).toHaveTextContent(
      /^npx @redis\/redisctl init$/,
    )
  })

  it('should not request a password for a previously opened database', () => {
    mockConnectedInstance({
      id: faker.string.uuid(),
      provider: ConnectionProvider.LOCALHOST,
      password: true,
    })
    renderComponent()

    expect(exportInstances).not.toHaveBeenCalled()
  })

  it('should reset the connect choice when another database opens', () => {
    mockConnectedInstance({ environment: Environment.Production })
    const instance = (connectedInstanceSelector as unknown as jest.Mock)()
    const { rerender } = renderComponent()
    fireEvent.click(screen.getByLabelText(`Connect ${databaseName}`))
    expect(screen.getByLabelText(`Connect ${databaseName}`)).toBeChecked()

    // react-redux caches the selected value, so the mocked instance is mutated
    // in place to simulate the store switching to the next database.
    const otherId = faker.string.uuid()
    instance.id = otherId
    reactRouterDom.useParams = jest
      .fn()
      .mockReturnValue({ instanceId: otherId })
    rerender(<RedisTools />)

    expect(screen.getByLabelText(`Connect ${databaseName}`)).not.toBeChecked()
  })

  it('should hide the connect option when no database is open', () => {
    mockConnectedInstance({}, null)
    renderComponent()

    expect(
      screen.queryByTestId('redis-tools-connect-database'),
    ).not.toBeInTheDocument()
  })

  it('should connect a local database without a password through its url', () => {
    mockConnectedInstance({ provider: ConnectionProvider.LOCALHOST })
    renderComponent()

    expect(screen.getByTestId('redis-tools-command')).toHaveTextContent(
      `${REDIS_TOOLS_INIT_COMMAND} --url 'redis://localhost:6379' --name ${databaseName}`,
    )
    expect(
      screen.queryByTestId('redis-tools-password-toggle'),
    ).not.toBeInTheDocument()
    expect(exportInstances).not.toHaveBeenCalled()
  })

  describe('with a password', () => {
    const maskedUrl = `'redis://default:${REDIS_TOOLS_PASSWORD_MASK}@localhost:6379'`
    const revealedUrl = `'redis://default:secret@localhost:6379'`

    beforeEach(() => {
      mockConnectedInstance({
        provider: ConnectionProvider.LOCALHOST,
        password: true,
      })
    })

    it('should mask the password by default', async () => {
      renderComponent()

      await waitFor(() => expect(exportInstances).toHaveBeenCalled())

      expect(screen.getByTestId('redis-tools-command')).toHaveTextContent(
        maskedUrl,
      )
      expect(screen.getByTestId('redis-tools-command')).not.toHaveTextContent(
        'secret',
      )
    })

    it('should request the password only for the open database', async () => {
      renderComponent()

      await waitFor(() =>
        expect(exportInstances).toHaveBeenCalledWith([mockInstanceId], true),
      )
    })

    it('should reveal and hide the password with the toggle', async () => {
      renderComponent()
      await waitFor(() =>
        expect(screen.getByTestId('redis-tools-password-toggle')).toBeEnabled(),
      )

      fireEvent.click(screen.getByTestId('redis-tools-password-toggle'))
      expect(screen.getByTestId('redis-tools-command')).toHaveTextContent(
        revealedUrl,
      )

      fireEvent.click(screen.getByTestId('redis-tools-password-toggle'))
      expect(screen.getByTestId('redis-tools-command')).toHaveTextContent(
        maskedUrl,
      )
    })

    it('should not request the password when connect is unchecked', () => {
      renderComponent()
      fireEvent.click(screen.getByLabelText(`Connect ${databaseName}`))

      expect(
        screen.queryByTestId('redis-tools-password-toggle'),
      ).not.toBeInTheDocument()
    })

    it('should disable copy and reveal until the password is loaded', async () => {
      let resolveLookup: (value: { password: string }[]) => void = () => {}
      ;(exportInstances as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolveLookup = resolve
        }),
      )
      renderComponent()

      expect(screen.getByTestId('redis-tools-copy-btn')).toBeDisabled()
      expect(screen.getByTestId('redis-tools-password-toggle')).toBeDisabled()

      await act(async () => {
        resolveLookup([{ password: 'secret' }])
      })

      expect(screen.getByTestId('redis-tools-copy-btn')).toBeEnabled()
      expect(screen.getByTestId('redis-tools-password-toggle')).toBeEnabled()
    })

    it('should keep a placeholder when the password lookup fails', async () => {
      ;(exportInstances as jest.Mock).mockRejectedValue(new Error('denied'))
      renderComponent()
      await waitFor(() =>
        expect(screen.getByTestId('redis-tools-password-toggle')).toBeEnabled(),
      )

      fireEvent.click(screen.getByTestId('redis-tools-password-toggle'))

      expect(screen.getByTestId('redis-tools-command')).toHaveTextContent(
        'redis://default:<password>@localhost:6379',
      )
    })
  })

  it('should only mention the Cloud sign in for a Redis Cloud database', () => {
    const signIn = /sign in to Redis Cloud/

    mockConnectedInstance({ provider: ConnectionProvider.LOCALHOST })
    const { unmount } = renderComponent()
    expect(screen.queryByText(signIn)).not.toBeInTheDocument()
    unmount()

    mockConnectedInstance()
    renderComponent()
    expect(screen.getByText(signIn)).toBeInTheDocument()
  })

  it('should hide the connect option for a database it cannot express', () => {
    mockConnectedInstance({
      provider: ConnectionProvider.LOCALHOST,
      connectionType: ConnectionType.Cluster,
    })
    renderComponent()

    expect(
      screen.queryByTestId('redis-tools-connect-database'),
    ).not.toBeInTheDocument()
  })

  it('should open Radar with the utm parameters', () => {
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null)
    renderComponent()

    fireEvent.click(screen.getByTestId('redis-tools-radar-link'))

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('utm_campaign=redisinsight'),
      '_blank',
      'noopener,noreferrer',
    )
    openSpy.mockRestore()
  })

  it('should mark Redvisor as coming soon', () => {
    renderComponent()

    expect(screen.getByTestId('redis-tools-redvisor-badge')).toHaveTextContent(
      'Coming soon',
    )
  })
})
