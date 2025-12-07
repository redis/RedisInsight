import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import TableResult from './TableResult'

const mockedError = { statusCode: 400, message: 'message', error: 'error' }

describe('TableResult', () => {
  it('should render', () => {
    render(<TableResult data={[{ index: 0, status: 'success' }]} />)
  })

  it('should not render table for empty data', () => {
    const { container } = render(<TableResult data={[]} />)

    expect(container.childNodes.length).toBe(0)
  })

  it('should render table data with success messages', () => {
    render(
      <TableResult
        data={[
          { index: 0, status: 'success', port: 1233, host: 'localhost' },
          { index: 1, status: 'success', port: 5233, host: 'localhost2' },
        ]}
      />,
    )

    expect(screen.getByTestId('table-index-0')).toHaveTextContent('(0)')
    expect(screen.getByTestId('table-index-1')).toHaveTextContent('(1)')
    expect(screen.getByTestId('table-host-port-0')).toHaveTextContent(
      'localhost:1233',
    )
    expect(screen.getByTestId('table-host-port-1')).toHaveTextContent(
      'localhost2:5233',
    )
    expect(screen.getByTestId('table-result-0')).toHaveTextContent('Successful')
    expect(screen.getByTestId('table-result-1')).toHaveTextContent('Successful')
  })

  it('should render table data with error messages', () => {
    render(
      <TableResult
        data={[
          {
            index: 0,
            status: 'error',
            port: 1233,
            errors: [mockedError, mockedError],
          },
          {
            index: 1,
            status: 'error',
            host: 'localhost2',
            errors: [mockedError],
          },
        ]}
      />,
    )
    expect(screen.getByTestId('table-result-0')).toHaveTextContent(
      [mockedError, mockedError].map((e) => e.message).join(''),
    )
    expect(screen.getByTestId('table-result-1')).toHaveTextContent(
      [mockedError].map((e) => e.message).join(''),
    )
  })
})
