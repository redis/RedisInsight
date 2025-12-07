import { cloneDeep } from 'lodash'
import React from 'react'

import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import {
  resetCliHelperSettings,
  resetCliSettings,
} from 'uiSrc/slices/cli/cli-settings'
import { resetOutputLoading } from 'uiSrc/slices/cli/cli-output'

import BottomGroupComponents from './BottomGroupComponents'

jest.mock('uiSrc/slices/cli/cli-settings', () => ({
  ...jest.requireActual('uiSrc/slices/cli/cli-settings'),
  cliSettingsSelector: jest.fn().mockReturnValue({
    isShowCli: true,
    isShowHelper: true,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const commandHelperId = 'command-helper'
const cliId = 'cli'

describe('BottomGroupComponents', () => {
  it('should render', () => {
    expect(render(<BottomGroupComponents />)).toBeTruthy()
  })

  it('should render Cli when isShowCli truthy', () => {
    render(<BottomGroupComponents />)
    expect(screen.getByTestId(cliId)).toBeInTheDocument()
  })

  it('should render Command Helper when isShowHelper truthy', () => {
    render(<BottomGroupComponents />)
    expect(screen.getByTestId(commandHelperId)).toBeInTheDocument()
  })

  it('should not to close command helper after closing cli', () => {
    render(<BottomGroupComponents />)
    fireEvent.click(screen.getByTestId('close-cli'))
    const expectedActions = [resetCliSettings(), resetOutputLoading()]
    expect(store.getActions()).toEqual(expect.arrayContaining(expectedActions))

    expect(screen.getByTestId('command-helper')).toBeInTheDocument()
  })

  it('should not to close cli after closing command-helper', () => {
    render(<BottomGroupComponents />)
    fireEvent.click(screen.getByTestId('close-command-helper'))

    const expectedActions = [resetCliHelperSettings()]
    expect(store.getActions()).toEqual(expect.arrayContaining(expectedActions))

    expect(screen.getByTestId('cli')).toBeInTheDocument()
  })
})
