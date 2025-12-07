import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, act } from 'uiSrc/utils/test-utils'
import TableResult, { Props } from './TableResult'

const mockedProps = mock<Props>()

describe.skip('TableResult', () => {
  it('should render', () => {
    expect(render(<TableResult {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('Result element should be "Not found." meanwhile result is [0]', async () => {
    const { queryByTestId, rerender } = render(
      <TableResult
        {...instance(mockedProps)}
        result={null}
        query="ft.search"
      />,
    )

    await act(() => {
      rerender(
        <TableResult
          {...instance(mockedProps)}
          result={[]}
          query="ft.search"
        />,
      )
    })

    const resultEl = queryByTestId(/query-table-no-results/)

    expect(resultEl).toBeInTheDocument()
  })

  it('Result element should have 4 cell meanwhile result is not empty', async () => {
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
      <TableResult {...instance(mockedProps)} result={[]} query="ft.search" />,
    )

    await act(() => {
      rerender(
        <TableResult
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
