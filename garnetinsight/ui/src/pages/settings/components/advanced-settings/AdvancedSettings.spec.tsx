import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import AdvancedSettings from './AdvancedSettings'

jest.mock('uiSrc/slices/user/user-settings', () => ({
  ...jest.requireActual('uiSrc/slices/user/user-settings'),
  userSettingsSelector: jest.fn().mockReturnValue({
    config: {
      scanThreshold: 10000,
      batchSize: 5,
    },
  }),
  updateUserConfigSettingsAction: () => jest.fn,
}))

describe('AdvancedSettings', () => {
  it('should render', () => {
    expect(render(<AdvancedSettings />)).toBeTruthy()
  })

  it('should Keys-to-scan-value render ', () => {
    render(<AdvancedSettings />)

    expect(screen.getByTestId(/keys-to-scan-value/)).toBeInTheDocument()
  })
})
