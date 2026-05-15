import { cloneDeep } from 'lodash'
import React from 'react'
import { updateUserConfigSettingsAction } from 'uiSrc/slices/user/user-settings'
import {
  cleanup,
  mockFeatureFlags,
  mockedStore,
  render,
  screen,
  userEvent,
} from 'uiSrc/utils/test-utils'

import SkipConfirmations from './SkipConfirmations'

jest.mock('uiSrc/slices/user/user-settings', () => {
  const original = jest.requireActual('uiSrc/slices/user/user-settings')
  return {
    ...original,
    updateUserConfigSettingsAction: jest.fn(() => ({ type: 'TEST_ACTION' })),
  }
})

let store: typeof mockedStore

describe('SkipConfirmations', () => {
  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
    ;(updateUserConfigSettingsAction as jest.Mock).mockClear()
    mockFeatureFlags({
      'dev-prodMode': { flag: true },
    })
  })

  it('should render with toggle off by default', () => {
    render(<SkipConfirmations />, { store })

    const toggle = screen.getByTestId(
      'switch-skip-confirmations-non-production',
    )
    expect(toggle).toBeInTheDocument()
    expect(toggle).not.toBeChecked()
  })

  it('should reflect persisted on state from settings', () => {
    const settings = store.getState().user.settings
    const prevConfig = settings.config
    // @ts-ignore-next-line
    settings.config = {
      ...prevConfig,
      skipConfirmationsForNonProduction: true,
    }

    try {
      render(<SkipConfirmations />, { store })

      expect(
        screen.getByTestId('switch-skip-confirmations-non-production'),
      ).toBeChecked()
    } finally {
      // mockedStore.getState() shares state reference across cloneDeep — restore.
      settings.config = prevConfig
    }
  })

  it('should dispatch update action when toggled on', async () => {
    render(<SkipConfirmations />, { store })

    await userEvent.click(
      screen.getByTestId('switch-skip-confirmations-non-production'),
    )

    expect(updateUserConfigSettingsAction).toHaveBeenCalledWith({
      skipConfirmationsForNonProduction: true,
    })
  })

  it('should not render when dev-prodMode feature flag is off', () => {
    mockFeatureFlags({
      'dev-prodMode': { flag: false },
    })

    render(<SkipConfirmations />, { store })

    expect(
      screen.queryByTestId('switch-skip-confirmations-non-production'),
    ).not.toBeInTheDocument()
  })
})
