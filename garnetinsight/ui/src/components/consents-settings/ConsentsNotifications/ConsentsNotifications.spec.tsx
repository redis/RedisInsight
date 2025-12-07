import React from 'react'
import { cloneDeep } from 'lodash'
import {
  render,
  userEvent,
  screen,
  mockedStore,
  cleanup,
  clearStoreActions,
} from 'uiSrc/utils/test-utils'
import { updateUserConfigSettings } from 'uiSrc/slices/user/user-settings'
import ConsentsNotifications from './ConsentsNotifications'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})
const COMMON_CONSENT_CONTENT = {
  defaultValue: false,
  required: false,
  editable: true,
  disabled: false,
  displayInSetting: true,
  since: '1.0.0',
  title: 'Title',
  label: '<a>Text</a>',
}

jest.mock('uiSrc/slices/user/user-settings', () => ({
  ...jest.requireActual('uiSrc/slices/user/user-settings'),
  userSettingsSelector: jest.fn().mockReturnValue({
    isShowConceptsPopup: true,
    config: {
      agreements: {
        eula: true,
        version: '1.0.1',
      },
    },
    spec: {
      version: '1.0.0',
      agreements: {
        eula: {
          ...COMMON_CONSENT_CONTENT,
          editable: false,
          displayInSetting: false,
          required: true,
        },
        eulaNew: {
          ...COMMON_CONSENT_CONTENT,
          editable: false,
          displayInSetting: false,
          required: true,
        },
        analytics: {
          ...COMMON_CONSENT_CONTENT,
          category: 'privacy',
        },
        notifications: {
          ...COMMON_CONSENT_CONTENT,
          category: 'notifications',
        },
        disabledConsent: {
          ...COMMON_CONSENT_CONTENT,
          disabled: true,
        },
      },
    },
  }),
}))

describe('ConsentsNotifications', () => {
  it('should render', () => {
    expect(render(<ConsentsNotifications />)).toBeTruthy()
  })

  it('should render proper elements', () => {
    render(<ConsentsNotifications />)
    expect(screen.getAllByTestId(/switch-option/)).toHaveLength(1)
  })

  describe('update settings', () => {
    it('option change should call "updateUserConfigSettingsAction"', async () => {
      render(<ConsentsNotifications />)

      const elements = screen.getAllByTestId(/switch-option/)
      await Promise.all(elements.map((el) => userEvent.click(el)))

      const expectedActions = [{}].fill(updateUserConfigSettings(), 0)
      expect(
        clearStoreActions(store.getActions().slice(0, expectedActions.length)),
      ).toEqual(clearStoreActions(expectedActions))
    })
  })
})
