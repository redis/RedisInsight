import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { toggleOpenWBResult } from 'uiSrc/slices/workbench/wb-results'
import { ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import {
  cleanup,
  clearStoreActions,
  fireEvent,
  mockedStore,
  render,
} from 'uiSrc/utils/test-utils'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import QueryCard, { Props, getSummaryText } from './QueryCard'

const mockedProps = mock<Props>()

const mockResult = [
  {
    response: 'response',
    status: 'success',
  },
]

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('uiSrc/slices/app/plugins', () => ({
  ...jest.requireActual('uiSrc/slices/app/plugins'),
  appPluginsSelector: jest.fn().mockReturnValue({
    visualizations: [],
  }),
}))

describe('QueryCard', () => {
  it('should render', () => {
    expect(render(<QueryCard {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('Cli result should not in the document before Expand', () => {
    const cliResultTestId = 'query-cli-result'

    const { queryByTestId } = render(<QueryCard {...instance(mockedProps)} />)

    const cliResultEl = queryByTestId(cliResultTestId)
    expect(cliResultEl).not.toBeInTheDocument()
  })

  it('Cli result should in the document when "isOpen = true"', () => {
    const cliResultTestId = 'query-cli-result'

    const { queryByTestId } = render(
      <QueryCard {...instance(mockedProps)} isOpen result={mockResult} />,
    )

    const cliResultEl = queryByTestId(cliResultTestId)

    expect(cliResultEl).toBeInTheDocument()
  })

  it('Cli result should not in the document when "isOpen = false"', () => {
    const cliResultTestId = 'query-cli-result'

    const { queryByTestId } = render(
      <QueryCard
        {...instance(mockedProps)}
        isOpen={false}
        result={mockResult}
      />,
    )

    const cliResultEl = queryByTestId(cliResultTestId)

    expect(cliResultEl).not.toBeInTheDocument()
  })

  it('Should be in the document when resultsMode === ResultsMode.GroupMode', () => {
    const cliResultTestId = 'query-cli-result'

    const { queryByTestId } = render(
      <QueryCard
        {...instance(mockedProps)}
        isOpen={false}
        result={mockResult}
        resultsMode={ResultsMode.GroupMode}
      />,
    )

    const cliResultEl = queryByTestId(cliResultTestId)

    expect(cliResultEl).not.toBeInTheDocument()
  })

  it('Click on the header should call toggleOpenWBResult', () => {
    const cardHeaderTestId = 'query-card-open'
    const mockId = '123'

    const { queryByTestId } = render(
      <QueryCard {...instance(mockedProps)} id={mockId} result={mockResult} />,
    )

    const cardHeaderTestEl = queryByTestId(cardHeaderTestId)

    fireEvent.click(cardHeaderTestEl)

    const expectedActions = [toggleOpenWBResult(mockId)]
    expect(
      clearStoreActions(store.getActions().slice(0, expectedActions.length)),
    ).toEqual(clearStoreActions(expectedActions))
  })

  it('Should return correct summary string', () => {
    const summary = { total: 2, success: 1, fail: 1 }
    const summaryText = '2 Command(s) - 1 success, 1 error(s)'

    const summaryString = getSummaryText(summary)

    expect(summaryString).toEqual(summaryText)
  })

  it('should render QueryCardCliResultWrapper when command is null', () => {
    const { queryByTestId } = render(
      <QueryCard
        {...instance(mockedProps)}
        resultsMode={ResultsMode.GroupMode}
        result={null}
        isOpen
        command={null}
      />,
    )
    const queryCommonResultEl = queryByTestId('query-common-result-wrapper')
    const queryCliResultEl = queryByTestId('query-cli-result-wrapper')

    expect(queryCommonResultEl).toBeInTheDocument()
    expect(queryCliResultEl).not.toBeInTheDocument()
  })

  it('should render QueryCardCliResult when result reached response size threshold', () => {
    const { queryByTestId } = render(
      <QueryCard
        {...instance(mockedProps)}
        resultsMode={ResultsMode.GroupMode}
        result={[
          {
            status: CommandExecutionStatus.Success,
            response: 'Any message about size limit threshold exceeded',
            sizeLimitExceeded: true,
          },
        ]}
        isOpen
        command={null}
      />,
    )
    const queryCliResultEl = queryByTestId('query-cli-result')

    expect(queryCliResultEl).toBeInTheDocument()
  })

  it('should render properly result when it has pure number', () => {
    const { getByTestId } = render(
      <QueryCard
        {...instance(mockedProps)}
        resultsMode={ResultsMode.GroupMode}
        result={[
          {
            status: CommandExecutionStatus.Success,
            response: 1,
          },
        ]}
        isOpen
        command="del key"
      />,
    )
    const queryCliResultEl = getByTestId('query-cli-result')

    expect(queryCliResultEl.textContent).toBe('(integer) 1')
  })

  it('should render QueryCardCliResult when result reached response size threshold even w/o flag', () => {
    const { queryByTestId } = render(
      <QueryCard
        {...instance(mockedProps)}
        resultsMode={ResultsMode.GroupMode}
        result={[
          {
            status: CommandExecutionStatus.Success,
            response:
              'Results have been deleted since they exceed 1 MB. Re-run the command to see new results.',
          },
        ]}
        isOpen
        command={null}
      />,
    )
    const queryCliResultEl = queryByTestId('query-cli-result')

    expect(queryCliResultEl).toBeInTheDocument()
  })
})
