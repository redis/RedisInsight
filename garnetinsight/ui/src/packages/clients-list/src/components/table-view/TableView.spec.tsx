import React from 'react'
import { instance, mock } from 'ts-mockito'
import TableView, { Props } from './TableView'
import {
  render,
  waitFor,
} from '../../../../../Garnetinsight/garnetinsight/ui/src/utils/test-utils'

const mockedProps = mock<Props>()

describe.skip('TableResult', () => {
  it('should render', () => {
    expect(render(<TableView {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('Result element should be "Not found." meanwhile result is [0]', async () => {
    const { queryByTestId, rerender } = render(
      <TableView {...instance(mockedProps)} result={null} query="ft.search" />,
    )

    await waitFor(() => {
      rerender(
        <TableView {...instance(mockedProps)} result={[]} query="ft.search" />,
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
      <TableView {...instance(mockedProps)} result={[]} query="ft.search" />,
    )

    await waitFor(() => {
      rerender(
        <TableView
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
