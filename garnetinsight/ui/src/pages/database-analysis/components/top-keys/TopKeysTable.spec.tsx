import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { Key } from 'apiSrc/modules/database-analysis/models/key'

import TopKeysTable, { Props } from './TopKeysTable'

const mockedProps = mock<Props>()

const mockData: Key[] = [
  {
    name: 'name',
    type: 'hash',
    memory: 10_000_000,
    length: 100_000_000,
    ttl: 10,
  },
  {
    name: 'name_1',
    type: 'hash',
    memory: 1000,
    length: null as any,
    ttl: -1,
  },
]

describe('Table', () => {
  it('should render', () => {
    expect(render(<TopKeysTable {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render', () => {
    expect(render(<TopKeysTable {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render table with 2 items', () => {
    render(<TopKeysTable {...instance(mockedProps)} data={mockData} />)
    expect(screen.getAllByTestId('top-keys-table-name')).toHaveLength(2)
  })

  it('should render correct ttl', () => {
    render(<TopKeysTable {...instance(mockedProps)} data={mockData} />)
    expect(screen.getByTestId('ttl-no-limit-name_1')).toHaveTextContent(
      'No limit',
    )
    expect(screen.getByTestId('ttl-name')).toHaveTextContent('10 s')
  })

  it('should render correct length', () => {
    render(<TopKeysTable {...instance(mockedProps)} data={mockData} />)
    expect(screen.getByTestId('length-empty-name_1')).toHaveTextContent('-')
    expect(screen.getByTestId(/length-value-name/).textContent).toEqual(
      '100 000 000',
    )
  })

  it('should highlight big keys', () => {
    render(<TopKeysTable {...instance(mockedProps)} data={mockData} />)
    expect(
      screen.getByTestId('nsp-usedMemory-value=10000000-highlighted'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('length-value-name-highlighted'),
    ).toBeInTheDocument()
  })
})
