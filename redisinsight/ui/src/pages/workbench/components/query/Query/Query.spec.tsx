import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { QueryEditorContextProvider } from 'uiSrc/components/query'
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

const defaultContextValue = {
  query: '',
  setQuery: jest.fn(),
  isLoading: false,
  commands: [],
  indexes: [],
  onSubmit: jest.fn(),
}

const renderWithContext = (props: Props, contextOverrides = {}) =>
  render(
    <QueryEditorContextProvider
      value={{ ...defaultContextValue, ...contextOverrides }}
    >
      <Query {...props} />
    </QueryEditorContextProvider>,
  )

describe('Query', () => {
  it('should render', () => {
    expect(renderWithContext(instance(mockedProps))).toBeTruthy()
  })

  it('should call onClear when clear button is clicked', async () => {
    const setQueryMock = jest.fn()
    const onClearMock = jest.fn()

    const props: Props = {
      ...instance(mockedProps),
      useLiteActions: true,
      onClear: onClearMock,
    }

    renderWithContext(props, {
      query: 'test query',
      setQuery: setQueryMock,
    })

    // Ensure we start with the query input populated
    const queryInput = screen.getByTestId('monaco')
    expect(queryInput).toHaveValue('test query')

    // Find the clear button and click it
    const clearButton = screen.getByTestId('btn-clear')
    expect(clearButton).toBeInTheDocument()

    fireEvent.click(clearButton)

    // Verify that the onClear function was called and the query input is cleared
    expect(setQueryMock).toHaveBeenCalled()
    expect(onClearMock).toHaveBeenCalled()
  })
})
