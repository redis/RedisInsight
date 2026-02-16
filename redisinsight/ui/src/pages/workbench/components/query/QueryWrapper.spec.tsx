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
import QueryWrapper from './QueryWrapper'
import { type Props } from './QueryWrapper.types'

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

describe('QueryWrapper', () => {
  it('should render', () => {
    // connectedInstanceSelector.mockImplementation(() => ({
    //   id: '123',
    //   connectionType: 'CLUSTER',
    // }));

    // const sendCliClusterActionMock = jest.fn();

    // sendCliClusterCommandAction.mockImplementation(() => sendCliClusterActionMock);

    expect(render(<QueryWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call onClear callback when clear button is clicked', () => {
    const props: Props = {
      ...instance(mockedProps),
      queryProps: {
        useLiteActions: true,
      },
      query: 'test query',
      onClear: jest.fn(),
    }

    render(<QueryWrapper {...props} />)

    // Ensure we start with the query input populated
    const queryInput = screen.getByTestId('monaco')
    expect(queryInput).toHaveValue(props.query)

    // Find the clear button and click it
    const clearButton = screen.getByTestId('btn-clear')
    fireEvent.click(clearButton)

    // Verify that the onClear function was called and the query input is cleared
    expect(props.onClear).toHaveBeenCalled()
  })
})
