import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import CliInputWrapper, { Props } from './CliInputWrapper'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const autocompleteTestId = 'cli-command-autocomplete'
const redisCommandsPath = 'uiSrc/slices/app/redis-commands'

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

describe('CliInputWrapper', () => {
  it('should render', () => {
    expect(render(<CliInputWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('"get" command (with args) should render CliAutocomplete', () => {
    const setCommandMock = jest.fn()

    const command = 'get'

    render(
      <CliInputWrapper
        {...instance(mockedProps)}
        command={command}
        setCommand={setCommandMock}
      />,
    )

    expect(screen.getByTestId(autocompleteTestId)).toBeInTheDocument()
  })

  it('"client info" command (without args) should not render CliAutocomplete', () => {
    const setCommandMock = jest.fn()

    const command = 'client info'

    const { queryByTestId } = render(
      <CliInputWrapper
        {...instance(mockedProps)}
        command={command}
        setCommand={setCommandMock}
      />,
    )

    expect(queryByTestId(autocompleteTestId)).not.toBeInTheDocument()
  })
})
