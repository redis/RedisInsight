import React from 'react'
import { cloneDeep } from 'lodash'
import {
  userEvent,
  render,
  screen,
  mockedStore,
  cleanup,
} from 'uiSrc/utils/test-utils'
import ConsentsSettings from './ConsentsSettings'

const BTN_SUBMIT = 'btn-submit'

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

describe('ConsentsSettings', () => {
  it('should render', () => {
    expect(render(<ConsentsSettings />)).toBeTruthy()
  })

  it('should render proper elements', () => {
    render(<ConsentsSettings />)
    expect(screen.getAllByTestId(/switch-option/)).toHaveLength(4)
  })

  it('should be disabled submit button with required options with false value', () => {
    render(<ConsentsSettings />)
    expect(screen.getByTestId(BTN_SUBMIT)).toBeDisabled()
  })

  it('should be able to submit with required options with true value', async () => {
    render(<ConsentsSettings />)
    const elements = screen.getAllByTestId(/switch-option/)
    await Promise.all(elements.map((el) => userEvent.click(el)))
    expect(screen.getByTestId(BTN_SUBMIT)).not.toBeDisabled()
  })
})
