import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { DatabaseAnalysisFactory } from 'uiSrc/mocks/factories/database-analysis/DatabaseAnalysis.factory'

import TopKeys, { Props } from './TopKeys'

const mockedProps = mock<Props>()

const mockKey = {
  name: 'name',
  type: 'HASH',
  memory: 1000,
  length: 10,
  ttl: -1,
}

const mockData = DatabaseAnalysisFactory.build({
  topKeysLength: [mockKey],
  topKeysMemory: [mockKey],
})

describe('TopKeys', () => {
  it('should render', () => {
    expect(render(<TopKeys {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render top-keys-table-length when click "btn-change-table-keys" ', () => {
    const { queryByTestId } = render(
      <TopKeys {...instance(mockedProps)} data={mockData} />,
    )

    fireEvent.click(screen.getByTestId('btn-change-table-keys'))

    expect(queryByTestId('top-keys-table-memory')).not.toBeInTheDocument()
    expect(queryByTestId('top-keys-table-length')).toBeInTheDocument()
    expect(queryByTestId('btn-change-table-memory')).not.toBeDisabled()
    expect(queryByTestId('btn-change-table-keys')).toBeDisabled()
  })

  it('should render top-keys-table-memory when click "btn-change-table-memory" and memory button should be disabled', () => {
    const { queryByTestId } = render(
      <TopKeys {...instance(mockedProps)} data={mockData} />,
    )

    // memory button is disabled by default
    fireEvent.click(screen.getByTestId('btn-change-table-keys'))
    fireEvent.click(screen.getByTestId('btn-change-table-memory'))

    expect(queryByTestId('top-keys-table-memory')).toBeInTheDocument()
    expect(queryByTestId('top-keys-table-length')).not.toBeInTheDocument()
    expect(queryByTestId('btn-change-table-memory')).toBeDisabled()
    expect(queryByTestId('btn-change-table-keys')).not.toBeDisabled()
  })

  it('should render top-keys-table-memory by default" ', () => {
    const { queryByTestId } = render(
      <TopKeys {...instance(mockedProps)} data={mockData} />,
    )

    expect(queryByTestId('top-keys-table-memory')).toBeInTheDocument()
    expect(queryByTestId('top-keys-table-length')).not.toBeInTheDocument()
    expect(queryByTestId('btn-change-table-memory')).toBeDisabled()
    expect(queryByTestId('btn-change-table-keys')).not.toBeDisabled()
  })

  it('should not render tables when topKeysLength and topKeysMemory are empty array', () => {
    const emptyMockData = DatabaseAnalysisFactory.build({
      topKeysLength: [],
      topKeysMemory: [],
    })
    const { queryByTestId } = render(
      <TopKeys {...instance(mockedProps)} data={emptyMockData} />,
    )

    expect(queryByTestId('top-keys-table-memory')).not.toBeInTheDocument()
    expect(queryByTestId('top-keys-table-length')).not.toBeInTheDocument()
  })

  it('should render loader when loading="true"', () => {
    const { queryByTestId } = render(
      <TopKeys {...instance(mockedProps)} data={mockData} loading />,
    )
    expect(queryByTestId('top-keys-table-memory')).not.toBeInTheDocument()
    expect(queryByTestId('top-keys-table-length')).not.toBeInTheDocument()
    expect(queryByTestId('table-loader')).toBeInTheDocument()
  })

  it('should render TOP KEYS title', () => {
    const { queryByText } = render(
      <TopKeys {...instance(mockedProps)} data={mockData} />,
    )
    expect(queryByText('TOP KEYS')).toBeInTheDocument()
    expect(queryByText('TOP 15 KEYS')).not.toBeInTheDocument()
  })

  it('should render TOP 15 KEYS title', () => {
    const largeMockData = DatabaseAnalysisFactory.build({
      topKeysLength: Array.from({ length: 15 }, () => mockKey),
      topKeysMemory: Array.from({ length: 15 }, () => mockKey),
    })

    const { queryByText } = render(
      <TopKeys {...instance(mockedProps)} data={largeMockData} />,
    )

    expect(queryByText('TOP KEYS')).not.toBeInTheDocument()
    expect(queryByText('TOP 15 KEYS')).toBeInTheDocument()
  })
})
