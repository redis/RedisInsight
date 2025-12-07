import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, act } from 'uiSrc/utils/test-utils'
import TableInfoResult, { Props } from './TableInfoResult'

const mockedProps = mock<Props>()

const resultMock: any[] = []

describe.skip('TableInfoResult', () => {
  it('should render', () => {
    expect(
      render(<TableInfoResult query="get" result={resultMock} />),
    ).toBeTruthy()
  })

  it('Result element should be "Not found." meanwhile result is [0]', async () => {
    const { queryByTestId, rerender } = render(
      <TableInfoResult
        {...instance(mockedProps)}
        result={null}
        query="ft.search"
      />,
    )

    await act(() => {
      rerender(
        <TableInfoResult
          {...instance(mockedProps)}
          result={[]}
          query="ft.search"
        />,
      )
    })

    const resultEl = queryByTestId(/query-table-no-results/)

    expect(resultEl).toBeInTheDocument()
  })

  it.skip('Result element should have 4 cell meanwhile result is not empty', async () => {
    const result = [
      {
        Doc: 'red:2',
        title: 'Redis Labs',
      },
      {
        Doc: 'red:1',
        title: 'Redis Labs',
      },
    ]

    const { queryByTestId, queryAllByTestId, rerender } = render(
      <TableInfoResult
        {...instance(mockedProps)}
        result={[]}
        query="ft.search"
      />,
    )

    await act(() => {
      rerender(
        <TableInfoResult
          {...instance(mockedProps)}
          result={result}
          query="ft.search"
        />,
      )
    })

    const resultEl = queryByTestId(/query-table-result/)
    const columnsEl = queryAllByTestId(/query-column/)

    expect(resultEl).toBeInTheDocument()
    expect(columnsEl?.length).toEqual(4)
  })
})
