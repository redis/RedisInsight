import React from 'react'
import { cloneDeep } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  mockedStore,
  cleanup,
} from 'uiSrc/utils/test-utils'
import {
  clearSearchingCommand,
  setSearchingCommand,
  setCliEnteringCommand,
} from 'uiSrc/slices/cli/cli-settings'
import CHSearchWrapper from './CHSearchWrapper'

let store: typeof mockedStore
const redisCommandsPath = 'uiSrc/slices/app/redis-commands'

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock(redisCommandsPath, () => {
  const defaultState = jest.requireActual(redisCommandsPath).initialState
  return {
    ...jest.requireActual(redisCommandsPath),
    appRedisCommandsSelector: jest.fn().mockReturnValue({
      ...defaultState,
    }),
  }
})

describe('CHSearchInput', () => {
  it('should render', () => {
    expect(render(<CHSearchWrapper />)).toBeTruthy()
  })

  it('should call search action after typing', () => {
    render(<CHSearchWrapper />)
    fireEvent.change(screen.getByTestId('cli-helper-search'), {
      target: { value: 'set' },
    })
    const expectedActions = [setSearchingCommand('set')]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call clear search action after clear input', () => {
    render(<CHSearchWrapper />)
    const searchInput = screen.getByTestId('cli-helper-search')
    fireEvent.change(searchInput, { target: { value: 'set' } })
    fireEvent.change(searchInput, { target: { value: '' } })
    const expectedActions = [
      setSearchingCommand('set'),
      clearSearchingCommand(),
      setCliEnteringCommand(),
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
