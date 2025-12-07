import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import CommandHelper, { Props } from './CommandHelper'

const mockedProps = mock<Props>()
let store: typeof mockedStore

const redisCommandsPath = 'uiSrc/slices/app/redis-commands'

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
      commandsArray: MOCK_COMMANDS_ARRAY,
    }),
  }
})

const commandLine = 'get'
const mockedSearchedCommands = ['HSET', 'SET']

describe('CliHelper', () => {
  it('should render', () => {
    expect(render(<CommandHelper {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('Cli Helper should be in the Document', () => {
    render(<CommandHelper {...instance(mockedProps)} />)

    const cliHelper = screen.queryByTestId('cli-helper')

    expect(cliHelper).toBeInTheDocument()
  })

  it('Default text component should be in the Document by default', () => {
    render(<CommandHelper {...instance(mockedProps)} />)

    const cliHelperDefault = screen.queryByTestId('cli-helper-default')

    expect(cliHelperDefault).toBeInTheDocument()
  })

  it('Default text component should not be in the Document when Command is matched', () => {
    const { queryByTestId } = render(
      <CommandHelper {...instance(mockedProps)} commandLine={commandLine} />,
    )

    const cliHelperDefault = queryByTestId('cli-helper-default')

    expect(cliHelperDefault).not.toBeInTheDocument()
  })

  it('Cli Helper search should be in the Document', () => {
    render(<CommandHelper {...instance(mockedProps)} />)

    const cliHelperSearch = screen.queryByTestId('cli-helper-search')

    expect(cliHelperSearch).toBeInTheDocument()
  })

  it('Title text component should be in the Document when Command is matched', () => {
    const { queryByTestId } = render(
      <CommandHelper {...instance(mockedProps)} commandLine={commandLine} />,
    )

    const cliHelperTitle = queryByTestId('cli-helper-title')

    expect(cliHelperTitle).toBeInTheDocument()
  })

  it('Summary text component should be in the Document when Command is matched and summary exists', () => {
    const { queryByTestId } = render(
      <CommandHelper
        {...instance(mockedProps)}
        commandLine={commandLine}
        summary="summary"
      />,
    )

    const cliHelperTitle = queryByTestId('cli-helper-summary')

    expect(cliHelperTitle).toBeInTheDocument()
  })

  it('Complexity badge text component should be in the Document when Command is matched and complexity exists', () => {
    const { queryByTestId } = render(
      <CommandHelper
        {...instance(mockedProps)}
        commandLine={commandLine}
        complexityShort="O(N)"
      />,
    )

    const cliHelperTitle = queryByTestId('cli-helper-complexity-short')

    expect(cliHelperTitle).toBeInTheDocument()
  })

  it('Complexity text component should be in the Document when Command is matched and complexity exists', () => {
    const { queryByTestId } = render(
      <CommandHelper
        {...instance(mockedProps)}
        commandLine={commandLine}
        complexity="O(N) bla bla"
      />,
    )

    const cliHelperTitle = queryByTestId('cli-helper-complexity')

    expect(cliHelperTitle).toBeInTheDocument()
  })

  it('Complexity text component should not be in the Document when Command is matched and complexity exists and ComplexityShort detected', () => {
    const { queryByTestId } = render(
      <CommandHelper
        {...instance(mockedProps)}
        commandLine={commandLine}
        complexity="O(N)"
        complexityShort="O(N)"
      />,
    )

    const cliHelperTitle = queryByTestId('cli-helper-complexity')

    expect(cliHelperTitle).not.toBeInTheDocument()
  })

  it('Since text component should be in the Document when Command is matched and since exists', () => {
    const { queryByTestId } = render(
      <CommandHelper
        {...instance(mockedProps)}
        commandLine={commandLine}
        since="2.0"
      />,
    )

    const cliHelperTitle = queryByTestId('cli-helper-since')

    expect(cliHelperTitle).toBeInTheDocument()
  })

  it('Arguments component should be in the Document when Command is matched and argList exists', () => {
    // eslint-disable-next-line react/no-array-index-key
    const argList = ['key', 'field'].map((field, i) => (
      <div key={i}>{field}</div>
    ))
    const { queryByTestId } = render(
      <CommandHelper
        {...instance(mockedProps)}
        commandLine={commandLine}
        argList={argList}
      />,
    )

    const cliHelperTitle = queryByTestId('cli-helper-arguments')

    expect(cliHelperTitle).toBeInTheDocument()
  })

  it('Search results should be in the Document when Command is matched', () => {
    render(
      <CommandHelper
        {...instance(mockedProps)}
        isSearching
        searchedCommands={mockedSearchedCommands}
      />,
    )
    const cliHelperSearchResultsTitle = screen.queryAllByTestId(
      /cli-helper-output-title/,
    )

    expect(cliHelperSearchResultsTitle).toHaveLength(2)
  })
})
