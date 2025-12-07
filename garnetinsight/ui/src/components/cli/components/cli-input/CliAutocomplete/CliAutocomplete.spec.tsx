import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import {
  setMatchedCommand,
  clearSearchingCommand,
} from 'uiSrc/slices/cli/cli-settings'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import CliAutocomplete, { Props } from './CliAutocomplete'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const CliAutocompleteTestId = 'cli-command-autocomplete'
const scanCommand = 'scan'
const scanArgs = [
  {
    name: 'cursor',
    type: 'integer',
  },
  {
    token: 'MATCH',
    name: 'pattern',
    type: 'pattern',
    optional: true,
  },
  {
    token: 'COUNT',
    name: 'count',
    type: 'integer',
    optional: true,
  },
  {
    token: 'TYPE',
    name: 'type',
    type: 'string',
    optional: true,
  },
]

describe('CliAutocomplete', () => {
  it('should render', () => {
    expect(render(<CliAutocomplete {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('Autocomplete should not be in the Document with empty array of arguments prop ', () => {
    const command = 'clear'

    const { queryByTestId } = render(
      <CliAutocomplete
        {...instance(mockedProps)}
        commandName={command}
        arguments={[]}
      />,
    )

    const autocompleteComponent = queryByTestId(CliAutocompleteTestId)

    expect(autocompleteComponent).not.toBeInTheDocument()
  })

  it('Autocomplete should be in Document with "scan" command ', () => {
    const { queryByTestId } = render(
      <CliAutocomplete
        {...instance(mockedProps)}
        commandName={scanCommand}
        arguments={scanArgs}
      />,
    )

    const autocompleteComponent = queryByTestId(CliAutocompleteTestId)

    expect(autocompleteComponent).toBeInTheDocument()
  })

  it('should "setMatchedCommand" & "clearSearchingCommand" action be called after unmount with empty string', () => {
    const { unmount } = render(
      <CliAutocomplete
        {...instance(mockedProps)}
        commandName={scanCommand}
        arguments={scanArgs}
      />,
    )

    unmount()

    const expectedActions = [setMatchedCommand(''), clearSearchingCommand()]
    expect(store.getActions().slice(-2)).toEqual(expectedActions)
  })

  it('Autocomplete should be only with optional args for "scan" command with filled in required args (new realization)', () => {
    const autocompleteOptionalText = '[MATCH pattern] [COUNT count] [TYPE type]'
    const { queryByTestId } = render(
      <CliAutocomplete
        {...instance(mockedProps)}
        provider="main"
        commandName={scanCommand}
        arguments={scanArgs}
        wordsTyped={2}
      />,
    )

    const autocompleteComponent = queryByTestId(CliAutocompleteTestId)

    expect(autocompleteOptionalText).toEqual(autocompleteComponent?.textContent)
  })

  it('Autocomplete should be only with optional args for "scan" command with filled in required args (old realization)', () => {
    const autocompleteOptionalText = '[pattern] [count] [type]'
    const { queryByTestId } = render(
      <CliAutocomplete
        {...instance(mockedProps)}
        provider="someprovider"
        commandName={scanCommand}
        arguments={scanArgs}
        wordsTyped={2}
      />,
    )

    const autocompleteComponent = queryByTestId(CliAutocompleteTestId)

    expect(autocompleteOptionalText).toEqual(autocompleteComponent?.textContent)
  })

  it('Autocomplete should be only with optional args for "scan" command with filled in required args (old realization)', () => {
    const autocompleteOptionalText = '[pattern] [count] [type]'
    const { queryByTestId } = render(
      <CliAutocomplete
        {...instance(mockedProps)}
        commandName={scanCommand}
        arguments={scanArgs}
        wordsTyped={2}
      />,
    )

    const autocompleteComponent = queryByTestId(CliAutocompleteTestId)

    expect(autocompleteOptionalText).toEqual(autocompleteComponent?.textContent)
  })

  it('Autocomplete should be only with optional args for "scan" command with filled in required args and several optional args', () => {
    const autocompleteOptionalText = '[MATCH pattern] [COUNT count] [TYPE type]'
    const { queryByTestId } = render(
      <CliAutocomplete
        {...instance(mockedProps)}
        provider="main"
        commandName={scanCommand}
        arguments={scanArgs}
        wordsTyped={10}
      />,
    )

    const autocompleteComponent = queryByTestId(CliAutocompleteTestId)

    expect(autocompleteOptionalText).toEqual(autocompleteComponent?.textContent)
  })
})
