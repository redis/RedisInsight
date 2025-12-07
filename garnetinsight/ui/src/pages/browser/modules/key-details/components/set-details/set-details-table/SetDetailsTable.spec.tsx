import React from 'react'
import { instance, mock } from 'ts-mockito'
import { setDataSelector } from 'uiSrc/slices/browser/set'
import { anyToBuffer } from 'uiSrc/utils'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import {
  GZIP_COMPRESSED_VALUE_1,
  DECOMPRESSED_VALUE_STR_1,
} from 'uiSrc/utils/tests/decompressors'
import { SetDetailsTable, Props } from './SetDetailsTable'

const members = [
  { type: 'Buffer', data: [49] },
  { type: 'Buffer', data: [50] },
  { type: 'Buffer', data: [51] },
]
const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/browser/set', () => {
  const defaultState = jest.requireActual(
    'uiSrc/slices/browser/set',
  ).initialState
  return {
    setSelector: jest.fn().mockReturnValue(defaultState),
    setDataSelector: jest.fn().mockReturnValue({
      ...defaultState,
      total: 3,
      key: { type: 'Buffer', data: [49] },
      keyName: { type: 'Buffer', data: [49] },
      members,
    }),
    fetchSetMembers: () => jest.fn(),
  }
})

describe('SetDetailsTable', () => {
  it('should render', () => {
    expect(render(<SetDetailsTable {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<SetDetailsTable {...instance(mockedProps)} />)
    const rows = container.querySelectorAll(
      '.ReactVirtualized__Table__row[role="row"]',
    )
    expect(rows).toHaveLength(members.length)
  })

  it('should render search input', () => {
    render(<SetDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByTestId('search')).toBeTruthy()
  })

  it('should call search', () => {
    render(<SetDetailsTable {...instance(mockedProps)} />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(searchInput, { target: { value: '*1*' } })
    expect(searchInput).toHaveValue('*1*')
  })

  it('should render delete popup after click remove button', () => {
    render(<SetDetailsTable {...instance(mockedProps)} />)
    fireEvent.click(screen.getAllByTestId(/set-remove-btn/)[0])
    expect(screen.getByTestId(/set-remove-btn-1-icon/)).toBeInTheDocument()
  })

  describe('decompressed  data', () => {
    it('should render decompressed GZIP data = "1"', () => {
      const defaultState = jest.requireActual(
        'uiSrc/slices/browser/set',
      ).initialState
      const setDataSelectorMock = jest.fn().mockReturnValue({
        ...defaultState,
        key: '123zxczxczxc',
        members: [anyToBuffer(GZIP_COMPRESSED_VALUE_1)],
      })
      setDataSelector.mockImplementation(setDataSelectorMock)

      const { queryByTestId } = render(
        <SetDetailsTable {...instance(mockedProps)} />,
      )
      const memberEl = queryByTestId(/set-member-value-/)

      expect(memberEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_1)
    })
  })
})
