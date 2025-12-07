import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import {
  KeyValueCompressor,
  TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
  TEXT_DISABLED_COMPRESSED_VALUE,
} from 'uiSrc/constants'
import { listDataSelector } from 'uiSrc/slices/browser/list'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { anyToBuffer } from 'uiSrc/utils'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
  waitForRiTooltipVisible,
} from 'uiSrc/utils/test-utils'
import {
  GZIP_COMPRESSED_VALUE_1,
  DECOMPRESSED_VALUE_STR_1,
} from 'uiSrc/utils/tests/decompressors'
import { setSelectedKeyRefreshDisabled } from 'uiSrc/slices/browser/keys'
import { MOCK_TRUNCATED_BUFFER_VALUE } from 'uiSrc/mocks/data/bigString'
import { ListDetailsTable, Props } from './ListDetailsTable'

const mockedProps = mock<Props>()

const elements = [
  { element: { type: 'Buffer', data: [49] }, index: 0 },
  { element: { type: 'Buffer', data: [50] }, index: 1 },
  { element: { type: 'Buffer', data: [51] }, index: 2 },
]

jest.mock('uiSrc/slices/browser/list', () => {
  const defaultState = jest.requireActual(
    'uiSrc/slices/browser/list',
  ).initialState
  return {
    listSelector: jest.fn().mockReturnValue(defaultState),
    updateListValueStateSelector: jest
      .fn()
      .mockReturnValue(defaultState.updateValue),
    listDataSelector: jest.fn().mockReturnValue({
      ...defaultState,
      total: 3,
      key: { type: 'Buffer', data: [49] },
      keyName: { type: 'Buffer', data: [49] },
      elements,
    }),
    fetchListElements: jest.fn(),
    fetchSearchingListElementAction: jest.fn,
    setListInitialState: jest.fn,
  }
})

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    compressor: null,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ListDetailsTable', () => {
  it('should render', () => {
    expect(render(<ListDetailsTable {...mockedProps} />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<ListDetailsTable {...mockedProps} />)
    const rows = container.querySelectorAll(
      '.ReactVirtualized__Table__row[role="row"]',
    )
    expect(rows).toHaveLength(elements.length)
  })

  it('should render search input', () => {
    render(<ListDetailsTable {...mockedProps} />)
    expect(screen.getByTestId('search')).toBeTruthy()
  })

  it('should call search', () => {
    render(<ListDetailsTable {...mockedProps} />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(searchInput, { target: { value: '111' } })
    expect(searchInput).toHaveValue('111')
  })

  it('should render editor after click edit button', async () => {
    render(<ListDetailsTable {...mockedProps} />)

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('list_content-value-1'))
    })

    fireEvent.click(screen.getByTestId('list_edit-btn-1'))
    expect(screen.getByTestId('list_value-editor-1')).toBeInTheDocument()
  })

  it('should render resize trigger for index column', () => {
    render(<ListDetailsTable {...mockedProps} />)
    expect(screen.getByTestId('resize-trigger-index')).toBeInTheDocument()
  })

  it('should disable refresh when editing', async () => {
    render(<ListDetailsTable {...mockedProps} />)

    const afterRenderActions = [...store.getActions()]

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('list_content-value-0'))
    })

    fireEvent.click(screen.getByTestId('list_edit-btn-0'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      setSelectedKeyRefreshDisabled(true),
    ])
  })

  describe('decompressed  data', () => {
    it('should render decompressed GZIP data = "1"', () => {
      const defaultState = jest.requireActual(
        'uiSrc/slices/browser/list',
      ).initialState
      const listDataSelectorMock = jest.fn().mockReturnValue({
        ...defaultState,
        key: '123zxczxczxc',
        elements: [{ element: anyToBuffer(GZIP_COMPRESSED_VALUE_1), index: 0 }],
      })
      ;(listDataSelector as jest.Mock).mockImplementation(listDataSelectorMock)

      render(<ListDetailsTable {...mockedProps} />)
      const elementEl = screen.getByTestId('list_content-value-0')

      expect(elementEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_1)
    })

    it('edit button should be disabled if data was compressed', async () => {
      const defaultState = jest.requireActual(
        'uiSrc/slices/browser/list',
      ).initialState
      const listDataSelectorMock = jest.fn().mockReturnValueOnce({
        ...defaultState,
        key: '123zxczxczxc',
        elements: [{ element: anyToBuffer(GZIP_COMPRESSED_VALUE_1), index: 0 }],
      })
      ;(listDataSelector as jest.Mock).mockImplementationOnce(
        listDataSelectorMock,
      )
      ;(connectedInstanceSelector as jest.Mock).mockImplementationOnce(() => ({
        compressor: KeyValueCompressor.GZIP,
      }))

      const { queryByTestId } = render(<ListDetailsTable {...mockedProps} />)
      act(() => {
        fireEvent.mouseEnter(screen.getByTestId('list_content-value-0'))
      })

      const editBtn = screen.getByTestId('list_edit-btn-0')

      fireEvent.click(editBtn)

      await act(async () => {
        fireEvent.focus(editBtn)
      })
      await waitForRiTooltipVisible()

      expect(editBtn).toBeDisabled()
      expect(screen.getByTestId('list_edit-tooltip-0')).toHaveTextContent(
        TEXT_DISABLED_COMPRESSED_VALUE,
      )
      expect(queryByTestId('list_value-editor-0')).not.toBeInTheDocument()
    })
  })

  describe('truncated values', () => {
    beforeEach(() => {
      const defaultState = jest.requireActual(
        'uiSrc/slices/browser/list',
      ).initialState
      const listDataSelectorMock = jest.fn().mockReturnValue({
        ...defaultState,
        key: '123zxczxczxc',
        elements: [{ element: MOCK_TRUNCATED_BUFFER_VALUE, index: 0 }],
      })
      ;(listDataSelector as jest.Mock).mockImplementation(listDataSelectorMock)
    })

    it('edit button should be disabled if data was truncated', async () => {
      const { queryByTestId } = render(<ListDetailsTable {...mockedProps} />)
      act(() => {
        fireEvent.mouseEnter(screen.getByTestId('list_content-value-0'))
      })

      const editBtn = screen.getByTestId('list_edit-btn-0')

      await act(async () => {
        fireEvent.focus(editBtn)
      })
      await waitForRiTooltipVisible()

      expect(editBtn).toBeDisabled()
      expect(screen.getByTestId('list_edit-tooltip-0')).toHaveTextContent(
        TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
      )

      fireEvent.click(editBtn)
      expect(queryByTestId('list_value-editor-0')).not.toBeInTheDocument()
    })
  })
})
