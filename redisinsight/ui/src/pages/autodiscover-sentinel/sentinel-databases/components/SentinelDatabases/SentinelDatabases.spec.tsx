import React from 'react'
import { instance, mock } from 'ts-mockito'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { ColumnDefinition } from 'uiSrc/components/base/layout'
import SentinelDatabases, { Props } from './SentinelDatabases'

const mockedProps = mock<Props>()

let mastersMock: ModifiedSentinelMaster[]
let columnsMock: ColumnDefinition<ModifiedSentinelMaster>[]

beforeEach(() => {
  cleanup()

  columnsMock = [
    {
      header: 'Master group',
      id: 'name',
      accessorKey: 'name',
      enableSorting: true,
    },
  ]

  mastersMock = [
    {
      name: 'mymaster',
      host: 'localhost',
      port: 6379,
      alias: 'alias',
      numberOfSlaves: 0,
    },
  ]
})

describe('SentinelDatabases', () => {
  it('should render', () => {
    expect(
      render(
        <SentinelDatabases
          {...instance(mockedProps)}
          columns={columnsMock}
          masters={mastersMock}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render "empty" text if noone master was fetched', () => {
    render(
      <SentinelDatabases
        {...instance(mockedProps)}
        columns={columnsMock}
        masters={[]}
      />,
    )
    expect(
      screen.getAllByText(
        'Your Redis Sentinel has no primary groups available.',
      ),
    ).toBeTruthy()
  })

  it('should render search input', () => {
    render(
      <SentinelDatabases
        {...instance(mockedProps)}
        columns={columnsMock}
        masters={mastersMock}
      />,
    )
    expect(screen.getByTestId(/search/i)).toBeTruthy()
  })

  it('should call search and result exist', () => {
    render(
      <SentinelDatabases
        {...instance(mockedProps)}
        columns={columnsMock}
        masters={mastersMock}
      />,
    )
    const searchInput = screen.getByTestId(/search/i)

    const searchQuery = 'mymaster'
    fireEvent.change(searchInput, { target: { value: searchQuery } })
    expect(searchInput).toHaveValue(searchQuery)
    const searchResultRow1 = screen.getByText(searchQuery)
    expect(searchResultRow1).toBeTruthy()
  })

  it("should call search and result doesn't exist", () => {
    render(
      <SentinelDatabases
        {...instance(mockedProps)}
        columns={columnsMock}
        masters={mastersMock}
      />,
    )
    const searchQuery = 'mymaster2'
    const searchInput = screen.getByTestId(/search/i)

    fireEvent.change(searchInput, { target: { value: searchQuery } })
    expect(searchInput).toHaveValue(searchQuery)

    expect(screen.getByText('Not found.')).toBeInTheDocument()
  })
})
