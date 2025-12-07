import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
  waitFor,
} from 'uiSrc/utils/test-utils'
import Query, { Props } from './Query'

const mockedProps = mock<Props>()
const redisCommandsPath = 'uiSrc/slices/app/redis-commands'

let store: typeof mockedStore
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

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

describe('Query', () => {
  it('should render', () => {
    expect(render(<Query {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call onClear when clear button is clicked', async () => {
    const props: Props = {
      ...instance(mockedProps),
      query: 'test query',
      useLiteActions: true,
      setQuery: jest.fn(),
      onClear: jest.fn(),
    }

    render(<Query {...props} />)

    // Ensure we start with the query input populated
    const queryInput = screen.getByTestId('monaco')
    expect(queryInput).toHaveValue(props.query)

    // Find the clear button and click it
    const clearButton = screen.getByTestId('btn-clear')
    expect(clearButton).toBeInTheDocument()

    fireEvent.click(clearButton)

    // Verify that the onClear function was called and the query input is cleared
    expect(props.setQuery).toHaveBeenCalled()
    expect(props.onClear).toHaveBeenCalled()
  })
})
