import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { zsetDataSelector } from 'uiSrc/slices/browser/zset'
import { anyToBuffer } from 'uiSrc/utils'
import {
  render,
  screen,
  fireEvent,
  act,
  mockedStore,
  cleanup,
  waitForRiPopoverVisible,
  waitForRiTooltipVisible,
} from 'uiSrc/utils/test-utils'
import {
  GZIP_COMPRESSED_VALUE_1,
  DECOMPRESSED_VALUE_STR_1,
} from 'uiSrc/utils/tests/decompressors'
import { setSelectedKeyRefreshDisabled } from 'uiSrc/slices/browser/keys'
import { MOCK_TRUNCATED_BUFFER_VALUE } from 'uiSrc/mocks/data/bigString'
import { TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA } from 'uiSrc/constants'
import { ZSetDetailsTable, Props } from './ZSetDetailsTable'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/browser/zset', () => {
  const defaultState = jest.requireActual(
    'uiSrc/slices/browser/zset',
  ).initialState
  return {
    zsetSelector: jest.fn().mockReturnValue(defaultState),
    setZsetInitialState: jest.fn,
    zsetDataSelector: jest.fn().mockReturnValue({
      ...defaultState,
      total: 4,
      key: 'z',
      keyName: 'z',
      members: [
        { name: { type: 'Buffer', data: [49] }, score: 1 },
        { name: { type: 'Buffer', data: [50] }, score: 2 },
        { name: { type: 'Buffer', data: [51] }, score: 3 },
        { name: { type: 'Buffer', data: [52] }, score: 'inf' },
      ],
    }),
    updateZsetScoreStateSelector: jest
      .fn()
      .mockReturnValue(defaultState.updateScore),
    fetchSearchZSetMembers: () => jest.fn(),
  }
})

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ZSetDetailsTable', () => {
  it('should render', () => {
    expect(render(<ZSetDetailsTable {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render search input', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByPlaceholderText(/search/i)).toBeTruthy()
  })

  it('should call search', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: '*' } })
    expect(searchInput).toHaveValue('*')
  })

  it('should render delete popup after click remove button', async () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('zset-remove-button-1-icon'))
    await waitForRiPopoverVisible()
    expect(screen.getByTestId('zset-remove-button-1')).toBeInTheDocument()
  })

  it('should render disabled edit button', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('zset_content-value-3'))
    })

    expect(screen.getByTestId('zset_edit-btn-3')).toBeDisabled()
  })

  it('should render enabled edit button', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('zset_content-value-2'))
    })

    expect(screen.getByTestId('zset_edit-btn-2')).not.toBeDisabled()
  })

  it('should render editor after click edit button and able to change value', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('zset_content-value-2'))
    })

    fireEvent.click(screen.getByTestId('zset_edit-btn-2'))

    fireEvent.change(screen.getByTestId('inline-item-editor'), {
      target: { value: '123' },
    })
    expect(screen.getByTestId('inline-item-editor')).toHaveValue('123')
  })

  it('should render resize trigger for name column', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByTestId('resize-trigger-name')).toBeInTheDocument()
  })

  it('should disable refresh when editing', async () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)

    const afterRenderActions = [...store.getActions()]

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('zset_content-value-2'))
    })

    fireEvent.click(screen.getByTestId('zset_edit-btn-2'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      setSelectedKeyRefreshDisabled(true),
    ])
  })

  describe('decompressed  data', () => {
    it('should render decompressed GZIP data = "1"', () => {
      const defaultState = jest.requireActual(
        'uiSrc/slices/browser/zset',
      ).initialState
      const zsetDataSelectorMock = jest.fn().mockReturnValue({
        ...defaultState,
        key: '123zxczxczxc',
        members: [{ name: anyToBuffer(GZIP_COMPRESSED_VALUE_1), score: 1 }],
      })
      ;(zsetDataSelector as jest.Mock).mockImplementation(zsetDataSelectorMock)

      const { queryByTestId } = render(
        <ZSetDetailsTable {...instance(mockedProps)} />,
      )
      const memberEl = queryByTestId(/zset-member-value-/)

      expect(memberEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_1)
    })
  })

  describe('truncated data', () => {
    beforeEach(() => {
      const defaultState = jest.requireActual(
        'uiSrc/slices/browser/zset',
      ).initialState
      const zsetDataSelectorMock = jest.fn().mockReturnValue({
        ...defaultState,
        key: '123zxczxczxc',
        members: [{ name: MOCK_TRUNCATED_BUFFER_VALUE, score: 1 }],
      })
      ;(zsetDataSelector as jest.Mock).mockImplementation(zsetDataSelectorMock)
    })

    it('should not be able to edit when member name is truncated', async () => {
      render(<ZSetDetailsTable {...instance(mockedProps)} />)
      const score = screen.getByTestId(/zset_content-value-/)

      await act(async () => {
        fireEvent.mouseOver(score)
      })

      const scoreEditButton = screen.getByTestId(/zset_edit-btn-/)

      await act(async () => {
        fireEvent.focus(scoreEditButton)
      })
      await waitForRiTooltipVisible()

      expect(screen.getByTestId(/zset_edit-tooltip-/)).toHaveTextContent(
        TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
      )
    })

    it('should not be able to delete when member name is truncated', async () => {
      render(<ZSetDetailsTable {...instance(mockedProps)} />)
      const removeButton = screen.getByTestId(/zset-remove-button-/)

      expect(removeButton).toBeDisabled()

      await act(async () => {
        fireEvent.focus(removeButton)
      })
      await waitForRiTooltipVisible()

      expect(
        screen.getByTestId(/zset-remove-button-.+-tooltip$/),
      ).toHaveTextContent(TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA)
    })
  })
})
