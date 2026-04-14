import React from 'react'
import { faker } from '@faker-js/faker'
import { render, screen } from 'uiSrc/utils/test-utils'
import { appServerInfoSelector } from 'uiSrc/slices/app/info'
import AppVersion from './AppVersion'

jest.mock('uiSrc/slices/app/info', () => ({
  ...jest.requireActual('uiSrc/slices/app/info'),
  appServerInfoSelector: jest.fn().mockReturnValue(null),
}))

describe('AppVersion', () => {
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
})
