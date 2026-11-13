import React from 'react'
import reactRouterDom from 'react-router-dom'
import { Environment } from 'apiClient'
import { faker } from '@faker-js/faker'

import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { ConnectionProvider, ConnectionType } from 'uiSrc/slices/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import { DEV_TOOLS_INIT_COMMAND } from './DevTools.constants'
import { DevTools } from './DevTools'

const mockInstanceId = faker.string.uuid()

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn(),
}))

describe('DevTools', () => {
  const databaseName = 'orders-dev'

  const mockConnectedInstance = (
    overrides: Partial<{
      name: string
      host: string
      port: number
      connectionType: ConnectionType
      provider: ConnectionProvider
      environment: Environment
    }> = {},
    instanceId: string | null = mockInstanceId,
  ) => {
    reactRouterDom.useParams = jest
      .fn()
      .mockReturnValue({ instanceId: instanceId ?? undefined })
    ;(connectedInstanceSelector as unknown as jest.Mock).mockReturnValue({
      name: databaseName,
      host: 'localhost',
      port: 6379,
      connectionType: ConnectionType.Standalone,
      provider: ConnectionProvider.REDIS_CLOUD,
      environment: Environment.Development,
      ...overrides,
    })
  }

  const renderComponent = () => render(<DevTools />)

  beforeEach(() => {
    mockConnectedInstance()
  })

  it('should show the agent prompt with the connect command by default', () => {
    renderComponent()

    expect(screen.getByTestId('dev-tools-prompt')).toHaveTextContent(
      `${DEV_TOOLS_INIT_COMMAND} --cloud --name ${databaseName}`,
    )
  })

  it('should switch to the plain command in CLI mode', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('dev-tools-mode-cli'))

    expect(screen.getByTestId('dev-tools-command')).toHaveTextContent(
      `${DEV_TOOLS_INIT_COMMAND} --cloud --name ${databaseName}`,
    )
  })

  it('should drop the database flags when connect is unchecked', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('dev-tools-mode-cli'))
    fireEvent.click(screen.getByLabelText(`Connect ${databaseName}`))

    expect(screen.getByTestId('dev-tools-command')).toHaveTextContent(
      DEV_TOOLS_INIT_COMMAND,
    )
    expect(screen.getByTestId('dev-tools-command')).not.toHaveTextContent(
      '--cloud',
    )
  })

  it('should leave connect unchecked by default for a production database', () => {
    mockConnectedInstance({ environment: Environment.Production })
    renderComponent()

    expect(screen.getByLabelText(`Connect ${databaseName}`)).not.toBeChecked()
    expect(screen.getByTestId('dev-tools-prompt')).not.toHaveTextContent(
      '--cloud',
    )
  })

  it('should hide the connect option when no database is open', () => {
    mockConnectedInstance({}, null)
    renderComponent()

    expect(
      screen.queryByTestId('dev-tools-connect-database'),
    ).not.toBeInTheDocument()
  })

  it('should connect a local database through its url', () => {
    mockConnectedInstance({ provider: ConnectionProvider.LOCALHOST })
    renderComponent()

    expect(screen.getByTestId('dev-tools-prompt')).toHaveTextContent(
      `${DEV_TOOLS_INIT_COMMAND} --url redis://localhost:6379 --name ${databaseName}`,
    )
  })

  it('should tell the user to add the password for a local database', () => {
    mockConnectedInstance({ provider: ConnectionProvider.LOCALHOST })
    renderComponent()

    expect(screen.getByTestId('dev-tools-prompt')).toHaveTextContent(
      '--url redis://localhost:6379 --name',
    )
    expect(
      screen.getByTestId('dev-tools-credentials-notice'),
    ).toHaveTextContent('add it to REDIS_URL')
  })

  it('should not show the credentials note for a Redis Cloud database', () => {
    renderComponent()

    expect(
      screen.queryByTestId('dev-tools-credentials-notice'),
    ).not.toBeInTheDocument()
  })

  it('should hide the credentials note when connect is unchecked', () => {
    mockConnectedInstance({ provider: ConnectionProvider.LOCALHOST })
    renderComponent()

    fireEvent.click(screen.getByLabelText(`Connect ${databaseName}`))

    expect(
      screen.queryByTestId('dev-tools-credentials-notice'),
    ).not.toBeInTheDocument()
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
      screen.queryByTestId('dev-tools-connect-database'),
    ).not.toBeInTheDocument()
  })

  it('should open Radar with the utm parameters', () => {
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null)
    renderComponent()

    fireEvent.click(screen.getByTestId('dev-tools-radar-link'))

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('utm_campaign=redisinsight'),
      '_blank',
      'noopener,noreferrer',
    )
    openSpy.mockRestore()
  })

  it('should mark Redvisor as coming soon', () => {
    renderComponent()

    expect(screen.getByTestId('dev-tools-redvisor-badge')).toHaveTextContent(
      'Coming soon',
    )
  })
})
