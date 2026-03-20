import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import QueryCardCliResultWrapper, {
  Props,
  getResultText,
} from './QueryCardCliResultWrapper'
import QueryCardCliDefaultResult, {
  Props as QueryCardCliDefaultResultProps,
} from '../QueryCardCliDefaultResult/QueryCardCliDefaultResult'
import QueryCardCliGroupResult, {
  Props as QueryCardCliGroupResultProps,
} from '../QueryCardCliGroupResult/QueryCardCliGroupResult'

const mockedProps = mock<Props>()
const mockedQueryCardCliDefaultResultProps =
  mock<QueryCardCliDefaultResultProps>()
const mockedQueryCardCliGroupResultProps = mock<QueryCardCliGroupResultProps>()

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

describe('QueryCardCliResultWrapper', () => {
  it('should render', () => {
    const mockResult = [
      {
        response: 'response',
        status: CommandExecutionStatus.Success,
      },
    ]
    expect(
      render(
        <QueryCardCliResultWrapper
          {...instance(mockedProps)}
          result={mockResult}
        />,
      ),
    ).toBeTruthy()
  })

  it('Result element should render with result prop', () => {
    const mockResult = [
      {
        response: 'response',
        status: CommandExecutionStatus.Success,
      },
    ]

    render(
      <QueryCardCliResultWrapper
        {...instance(mockedProps)}
        result={mockResult}
      />,
    )

    expect(screen.queryByTestId('query-cli-result')).toBeInTheDocument()
    expect(screen.queryByTestId('query-cli-result')).toHaveTextContent(
      mockResult?.[0]?.response,
    )
  })

  it('Result element should render (nil) result', () => {
    const mockResult = [
      {
        response: '',
        status: CommandExecutionStatus.Success,
      },
    ]

    render(
      <QueryCardCliResultWrapper
        {...instance(mockedProps)}
        result={mockResult}
      />,
    )

    expect(screen.queryByTestId('query-cli-result')).toHaveTextContent('(nil)')
  })

  it('should render QueryCardCliDefaultResult', () => {
    expect(
      render(
        <QueryCardCliDefaultResult
          {...instance(mockedQueryCardCliDefaultResultProps)}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render QueryCardCliGroupResult', () => {
    const mockResult = [
      {
        response: ['response'],
        status: CommandExecutionStatus.Success,
      },
    ]

    render(
      <QueryCardCliResultWrapper
        {...instance(mockedProps)}
        resultsMode={ResultsMode.GroupMode}
        result={mockResult}
      />,
    )

    expect(
      render(
        <QueryCardCliGroupResult
          {...instance(mockedQueryCardCliGroupResultProps)}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render QueryCardCliDefaultResult when result.response is not array', () => {
    const mockResult = [
      {
        response: 'response',
        status: CommandExecutionStatus.Success,
      },
    ]

    render(
      <QueryCardCliResultWrapper
        {...instance(mockedProps)}
        resultsMode={ResultsMode.GroupMode}
        result={mockResult}
      />,
    )

    expect(
      render(
        <QueryCardCliDefaultResult
          {...instance(mockedQueryCardCliDefaultResultProps)}
        />,
      ),
    ).toBeTruthy()
  })

  it('Should render loader', () => {
    render(<QueryCardCliResultWrapper {...instance(mockedProps)} loading />)

    expect(screen.queryByTestId('query-cli-loader')).toBeInTheDocument()
  })

  it('should render warning', () => {
    const mockResult = [
      {
        response: 'response',
        status: CommandExecutionStatus.Success,
      },
    ]
    render(
      <QueryCardCliResultWrapper
        {...instance(mockedProps)}
        result={mockResult}
        isNotStored
      />,
    )

    expect(screen.queryByTestId('query-cli-warning')).toBeInTheDocument()
  })

  it('Result element should render (nil) result', () => {
    const mockResult = [
      {
        response: '',
        status: CommandExecutionStatus.Success,
      },
    ]

    const { queryByTestId } = render(
      <QueryCardCliResultWrapper
        {...instance(mockedProps)}
        result={mockResult}
      />,
    )

    const resultEl = queryByTestId('query-cli-card-result')

    expect(resultEl).toHaveTextContent('(nil)')
  })
})

describe('getResultText', () => {
  it('should return empty string when result is empty', () => {
    expect(getResultText([], 'PING')).toBe('')
    expect(getResultText(undefined, 'PING')).toBe('')
  })

  it('should return formatted text for single successful result', () => {
    const result = [
      {
        response: 'PONG',
        status: CommandExecutionStatus.Success,
      },
    ]

    const text = getResultText(result, 'PING')

    expect(text).toBe('"PONG"')
  })

  it('should return raw response for single failed result', () => {
    const result = [
      {
        response: 'ERR unknown command',
        status: CommandExecutionStatus.Fail,
      },
    ]

    const text = getResultText(result, 'INVALID')

    expect(text).toBe('ERR unknown command')
  })

  it('should return (nil) for empty successful response', () => {
    const result = [
      {
        response: '',
        status: CommandExecutionStatus.Success,
      },
    ]

    const text = getResultText(result, 'GET nonexistent')

    expect(text).toBe('"(nil)"')
  })

  it('should format group results with command prefix', () => {
    const result = [
      {
        response: [
          {
            command: 'PING',
            response: 'PONG',
            status: CommandExecutionStatus.Success,
          },
          {
            command: 'GET key',
            response: 'value',
            status: CommandExecutionStatus.Success,
          },
        ],
        status: CommandExecutionStatus.Success,
      },
    ]

    const text = getResultText(result, '', ResultsMode.GroupMode, 0)

    expect(text).toContain('[db0] > PING')
    expect(text).toContain('PONG')
    expect(text).toContain('[db0] > GET key')
    expect(text).toContain('value')
  })

  it('should use provided db number in group results prefix', () => {
    const result = [
      {
        response: [
          {
            command: 'PING',
            response: 'PONG',
            status: CommandExecutionStatus.Success,
          },
        ],
        status: CommandExecutionStatus.Success,
      },
    ]

    const text = getResultText(result, '', ResultsMode.GroupMode, 5)

    expect(text).toContain('[db5] > PING')
  })

  it('should handle failed commands in group results', () => {
    const result = [
      {
        response: [
          {
            command: 'INVALID',
            response: 'ERR unknown command',
            status: CommandExecutionStatus.Fail,
          },
        ],
        status: CommandExecutionStatus.Success,
      },
    ]

    const text = getResultText(result, '', ResultsMode.GroupMode, 0)

    expect(text).toContain('[db0] > INVALID')
    expect(text).toContain('ERR unknown command')
  })
})
