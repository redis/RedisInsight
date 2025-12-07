import { cloneDeep } from 'lodash'
import React from 'react'
import { InitOutputText } from 'uiSrc/components/messages/cli-output/cliOutput'
import { concatToOutput } from 'uiSrc/slices/cli/cli-output'
import { setCliEnteringCommand } from 'uiSrc/slices/cli/cli-settings'
import {
  cleanup,
  clearStoreActions,
  mockedStore,
  render,
} from 'uiSrc/utils/test-utils'
import CliWrapper from './CliWrapper'

const redisCommandsPath = 'uiSrc/slices/app/redis-commands'

let mathRandom: jest.SpyInstance<number>
const random = 0.91911
let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock(redisCommandsPath, () => {
  const defaultState = jest.requireActual(redisCommandsPath).initialState
  const { MOCK_COMMANDS_SPEC, MOCK_COMMANDS_ARRAY } =
    jest.requireActual('uiSrc/constants')
  return {
    ...jest.requireActual(redisCommandsPath),
    appRedisCommandsSelector: jest.fn().mockReturnValue({
      ...defaultState,
      spec: MOCK_COMMANDS_SPEC,
      commandsArray: Object.keys(MOCK_COMMANDS_ARRAY).sort(),
    }),
  }
})

describe('CliWrapper', () => {
  beforeAll(() => {
    mathRandom = jest.spyOn(Math, 'random').mockImplementation(() => random)
  })

  afterAll(() => {
    mathRandom.mockRestore()
  })

  it('should render', () => {
    expect(render(<CliWrapper />)).toBeTruthy()
  })
  it('Actions should be called after component will unmount', () => {
    const { unmount } = render(<CliWrapper />)

    unmount()

    const handleWorkbenchClick = () => {}

    const expectedActions = [
      concatToOutput(InitOutputText('', 0, 0, true, handleWorkbenchClick)),
      setCliEnteringCommand(),
    ]
    expect(clearStoreActions(store.getActions().slice(-2))).toEqual(
      clearStoreActions(expectedActions),
    )
  })
})
