import React from 'react'
import { faker } from '@faker-js/faker'
import { render, screen } from 'uiSrc/utils/test-utils'
import { appServerInfoSelector } from 'uiSrc/slices/app/info'
import { getConfig } from 'uiSrc/config'
import AppVersion from './AppVersion'

jest.mock('uiSrc/slices/app/info', () => ({
  ...jest.requireActual('uiSrc/slices/app/info'),
  appServerInfoSelector: jest.fn().mockReturnValue(null),
}))

jest.mock('uiSrc/config', () => ({
  ...jest.requireActual('uiSrc/config'),
  getConfig: jest.fn(),
}))

const mockGetConfig = (showBuildCommitSha: boolean) => {
  ;(getConfig as jest.Mock).mockReturnValue({ app: { showBuildCommitSha } })
}

describe('AppVersion', () => {
  beforeEach(() => {
    mockGetConfig(false)
  })

  it('should render app version when available', () => {
    const mockVersion = faker.system.semver()
    ;(appServerInfoSelector as jest.Mock).mockReturnValue({
      appVersion: mockVersion,
    })

    render(<AppVersion />)

    expect(screen.getByTestId('settings-app-version')).toHaveTextContent(
      `Redis Insight v${mockVersion}`,
    )
  })

  it('should not render when server info is null', () => {
    ;(appServerInfoSelector as jest.Mock).mockReturnValue(null)

    render(<AppVersion />)

    expect(screen.queryByTestId('settings-app-version')).not.toBeInTheDocument()
  })

  it('should not render when appVersion is missing', () => {
    ;(appServerInfoSelector as jest.Mock).mockReturnValue({})

    render(<AppVersion />)

    expect(screen.queryByTestId('settings-app-version')).not.toBeInTheDocument()
  })

  it('should append short build commit sha when showBuildCommitSha is enabled and sha is present', () => {
    mockGetConfig(true)
    const mockVersion = faker.system.semver()
    const mockSha = 'a1b2c3d4e5f6789'
    ;(appServerInfoSelector as jest.Mock).mockReturnValue({
      appVersion: mockVersion,
      buildCommitSha: mockSha,
    })

    render(<AppVersion />)

    expect(screen.getByTestId('settings-app-version')).toHaveTextContent(
      `Redis Insight v${mockVersion} (${mockSha.slice(0, 7)})`,
    )
  })

  it('should not append build commit sha when showBuildCommitSha is disabled', () => {
    mockGetConfig(false)
    const mockVersion = faker.system.semver()
    ;(appServerInfoSelector as jest.Mock).mockReturnValue({
      appVersion: mockVersion,
      buildCommitSha: 'a1b2c3d4e5f6789',
    })

    render(<AppVersion />)

    expect(screen.getByTestId('settings-app-version')).toHaveTextContent(
      `Redis Insight v${mockVersion}`,
    )
    expect(screen.getByTestId('settings-app-version')).not.toHaveTextContent(
      'a1b2c3d',
    )
  })

  it('should not append build commit sha when showBuildCommitSha is enabled but sha is missing', () => {
    mockGetConfig(true)
    const mockVersion = faker.system.semver()
    ;(appServerInfoSelector as jest.Mock).mockReturnValue({
      appVersion: mockVersion,
    })

    render(<AppVersion />)

    expect(screen.getByTestId('settings-app-version')).toHaveTextContent(
      `Redis Insight v${mockVersion}`,
    )
  })
})
