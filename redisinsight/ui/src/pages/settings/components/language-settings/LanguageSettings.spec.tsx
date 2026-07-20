import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  mockedStore,
  render,
  screen,
  userEvent,
  waitFor,
  waitForRedisUiSelectVisible,
} from 'uiSrc/utils/test-utils'
import { DEFAULT_LANGUAGE, LANGUAGE_NAMES } from 'uiSrc/i18n'
import { updateUserConfigSettingsAction } from 'uiSrc/slices/user/user-settings'

import LanguageSettings from './LanguageSettings'

jest.mock('uiSrc/i18n', () => {
  const actual = jest.requireActual('uiSrc/i18n')
  return {
    __esModule: true,
    ...actual,
    default: { language: 'en', changeLanguage: jest.fn() },
  }
})

jest.mock('uiSrc/slices/user/user-settings', () => {
  const original = jest.requireActual('uiSrc/slices/user/user-settings')
  return {
    ...original,
    updateUserConfigSettingsAction: jest.fn(() => ({ type: 'TEST_ACTION' })),
  }
})

const i18n = require('uiSrc/i18n').default

let store: typeof mockedStore

describe('LanguageSettings', () => {
  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(render(<LanguageSettings />)).toBeTruthy()
  })

  it('should render the default language selected when there is no previous config', async () => {
    render(<LanguageSettings />)

    await waitFor(() => {
      expect(
        screen.getByText(LANGUAGE_NAMES[DEFAULT_LANGUAGE]),
      ).toBeInTheDocument()
    })
  })

  it('should change language and persist it on selection', async () => {
    render(<LanguageSettings />, { store })

    await userEvent.click(screen.getByTestId('select-language'))
    await waitForRedisUiSelectVisible()

    await waitFor(() => {
      expect(screen.getByText(LANGUAGE_NAMES.bg)).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText(LANGUAGE_NAMES.bg))

    expect(i18n.changeLanguage).toHaveBeenCalledWith('bg')
    expect(updateUserConfigSettingsAction).toHaveBeenCalledWith({
      language: 'bg',
    })
  })
})
