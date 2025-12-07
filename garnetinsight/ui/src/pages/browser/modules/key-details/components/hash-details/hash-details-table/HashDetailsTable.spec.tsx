import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import {
  KeyValueCompressor,
  KeyValueFormat,
  TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_DISABLED_FORMATTER_EDITING,
} from 'uiSrc/constants'
import { hashDataSelector } from 'uiSrc/slices/browser/hash'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { anyToBuffer, bufferToString } from 'uiSrc/utils'
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
  GZIP_COMPRESSED_VALUE_2,
  DECOMPRESSED_VALUE_STR_1,
  DECOMPRESSED_VALUE_STR_2,
} from 'uiSrc/utils/tests/decompressors'
import {
  setSelectedKeyRefreshDisabled,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import {
  MOCK_TRUNCATED_BUFFER_VALUE,
  MOCK_TRUNCATED_STRING_VALUE,
} from 'uiSrc/mocks/data/bigString'
import { HashDetailsTable, Props } from './HashDetailsTable'

const mockedProps = mock<Props>()
const fields: Array<{ field: any; value: any; expire?: number }> = [
  {
    field: { type: 'Buffer', data: [49] },
    value: { type: 'Buffer', data: [49, 65] },
  },
  {
    field: { type: 'Buffer', data: [49, 50, 51] },
    value: { type: 'Buffer', data: [49, 11] },
  },
  {
    field: { type: 'Buffer', data: [50] },
    value: { type: 'Buffer', data: [49, 234, 453] },
    expire: 300,
  },
]

jest.mock('uiSrc/slices/browser/hash', () => {
  const defaultState = jest.requireActual(
    'uiSrc/slices/browser/hash',
  ).initialState
  return {
    hashSelector: jest.fn().mockReturnValue(defaultState),
    updateHashValueStateSelector: jest
      .fn()
      .mockReturnValue(defaultState.updateValue),
    hashDataSelector: jest.fn().mockReturnValue({
      ...defaultState,
      total: 3,
      key: '123zxczxczxc',
      fields,
    }),
    setHashInitialState: jest.fn,
    fetchHashFields: () => jest.fn,
  }
})

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    compressor: null,
  }),
}))

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  selectedKeySelector: jest.fn().mockReturnValue({
    viewFormat: 'Unicode',
    lastRefreshTime: Date.now(),
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  jest.clearAllMocks()
})

describe('HashDetailsTable', () => {
  it('should render', () => {
    expect(render(<HashDetailsTable {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(
      <HashDetailsTable {...instance(mockedProps)} />,
    )
    const rows = container.querySelectorAll(
      '.ReactVirtualized__Table__row[role="row"]',
    )
    expect(rows).toHaveLength(fields.length)
  })

  it('should render search input', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByTestId('search')).toBeTruthy()
  })

  it('should call search', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(searchInput, { target: { value: '*1*' } })
    expect(searchInput).toHaveValue('*1*')
  })

  it('should render delete popup after click remove button', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    fireEvent.click(screen.getAllByTestId(/remove-hash-button/)[0])
    expect(
      screen.getByTestId(
        `remove-hash-button-${bufferToString(fields[0].field)}-icon`,
      ),
    ).toBeInTheDocument()
  })

  it('should render editor after click edit button', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('hash_content-value-1'))
    })

    fireEvent.click(screen.getByTestId('hash_edit-btn-1'))
    expect(screen.getByTestId('hash_value-editor-1')).toBeInTheDocument()
  })

  it('should render resize trigger for field column', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByTestId('resize-trigger-field')).toBeInTheDocument()
  })

  it('should disable refresh after click on edit', async () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)

    const afterRenderActions = [...store.getActions()]

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('hash_content-value-1'))
    })

    act(() => {
      fireEvent.click(screen.getByTestId('hash_edit-btn-1'))
    })

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      setSelectedKeyRefreshDisabled(true),
    ])
  })

  it('should not render ttl column', async () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    expect(
      screen.queryByTestId('hash-ttl_content-value-2'),
    ).not.toBeInTheDocument()
  })

  it('should render ttl column', async () => {
    render(
      <HashDetailsTable {...instance(mockedProps)} isExpireFieldsAvailable />,
    )

    const afterRenderActions = [...store.getActions()]

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('hash-ttl_content-value-2'))
    })

    act(() => {
      fireEvent.click(screen.getByTestId('hash-ttl_edit-btn-2'))
    })

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      setSelectedKeyRefreshDisabled(true),
    ])
  })

  const nonEditableFormats = [KeyValueFormat.HEX, KeyValueFormat.Binary]

  test.each(nonEditableFormats)(
    'should disable edit button when viewFormat is not editable for format: %s',
    async (format) => {
      ;(selectedKeySelector as jest.Mock).mockReturnValueOnce({
        viewFormat: format,
        lastRefreshTime: Date.now(),
      })

      render(<HashDetailsTable {...instance(mockedProps)} />)

      act(() => {
        fireEvent.mouseEnter(screen.getByTestId('hash_content-value-1'))
      })

      const editBtn = screen.getByTestId('hash_edit-btn-1')
      expect(editBtn).toBeDisabled()

      act(() => {
        fireEvent.focus(editBtn)
      })

      await waitForRiTooltipVisible()
      expect(screen.getByTestId('hash_edit-tooltip-1')).toHaveTextContent(
        TEXT_DISABLED_FORMATTER_EDITING,
      )
    },
  )

  describe('decompressed  data', () => {
    it('should render decompressed GZIP data', () => {
      const defaultState = jest.requireActual(
        'uiSrc/slices/browser/hash',
      ).initialState
      const hashDataSelectorMock = jest.fn().mockReturnValue({
        ...defaultState,
        total: 1,
        key: '123zxczxczxc',
        fields: [
          {
            field: anyToBuffer(GZIP_COMPRESSED_VALUE_1),
            value: anyToBuffer(GZIP_COMPRESSED_VALUE_2),
          },
        ],
      })
      ;(hashDataSelector as jest.Mock).mockImplementation(hashDataSelectorMock)

      const { queryAllByTestId } = render(
        <HashDetailsTable {...instance(mockedProps)} />,
      )
      const fieldEl = queryAllByTestId(/hash-field-/)?.[0]
      const valueEl = queryAllByTestId(/hash_content-value/)?.[0]

      expect(fieldEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_1)
      expect(valueEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_2)
    })

    it('edit button should be disabled if data was compressed', async () => {
      const defaultState = jest.requireActual(
        'uiSrc/slices/browser/hash',
      ).initialState
      const hashDataSelectorMock = jest.fn().mockReturnValueOnce({
        ...defaultState,
        total: 1,
        key: '123zxczxczxc',
        fields: [
          {
            field: anyToBuffer(GZIP_COMPRESSED_VALUE_1),
            value: anyToBuffer(GZIP_COMPRESSED_VALUE_2),
          },
        ],
      })
      ;(hashDataSelector as jest.Mock).mockImplementationOnce(
        hashDataSelectorMock,
      )
      ;(connectedInstanceSelector as jest.Mock).mockImplementationOnce(() => ({
        compressor: KeyValueCompressor.GZIP,
      }))

      const { queryByTestId } = render(
        <HashDetailsTable {...instance(mockedProps)} />,
      )

      act(() => {
        fireEvent.mouseEnter(screen.getByTestId('hash_content-value-1'))
      })

      const editBtn = screen.getByTestId('hash_edit-btn-1')
      fireEvent.click(editBtn)

      await act(async () => {
        fireEvent.focus(editBtn)
      })
      await waitForRiTooltipVisible()

      expect(editBtn).toBeDisabled()
      expect(screen.getByTestId('hash_edit-tooltip-1')).toHaveTextContent(
        TEXT_DISABLED_COMPRESSED_VALUE,
      )
      expect(queryByTestId('hash_value-editor-1')).not.toBeInTheDocument()
    })
  })

  describe('truncated values', () => {
    beforeEach(() => {
      const defaultState = jest.requireActual(
        'uiSrc/slices/browser/hash',
      ).initialState
      const hashDataSelectorMock = jest.fn().mockReturnValue({
        ...defaultState,
        total: 2,
        key: '123zxczxczxc',
        fields: [
          { field: 'regular-field', value: MOCK_TRUNCATED_BUFFER_VALUE },
          { field: MOCK_TRUNCATED_BUFFER_VALUE, value: 'regular-value' },
        ],
      })
      ;(hashDataSelector as jest.Mock).mockImplementation(hashDataSelectorMock)
    })

    it('should disable delete entry when field name is truncated', async () => {
      render(<HashDetailsTable {...instance(mockedProps)} />)

      // check delete actions
      const removeHashButtons = screen.getAllByTestId(
        /remove-hash-button.+-icon$/,
      )
      expect(removeHashButtons.length).toEqual(2)
      expect(removeHashButtons[0]).toBeEnabled()
      expect(removeHashButtons[1]).toBeDisabled()

      // button with disabled removing
      await act(async () => {
        fireEvent.focus(removeHashButtons[1])
      })
      await waitForRiTooltipVisible()
      expect(
        screen.getByTestId(
          `remove-hash-button-${MOCK_TRUNCATED_STRING_VALUE}-tooltip`,
        ),
      ).toHaveTextContent(TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA)
    })

    it('should disable editing value when entry value is truncated', async () => {
      const { queryByTestId } = render(
        <HashDetailsTable {...instance(mockedProps)} />,
      )

      const hashValue = screen.getByTestId('hash_content-value-regular-field')

      await act(async () => {
        fireEvent.mouseEnter(hashValue)
      })

      const editButton = screen.getByTestId('hash_edit-btn-regular-field')
      expect(editButton).toBeDisabled()

      await act(async () => {
        fireEvent.focus(editButton)
      })
      await waitForRiTooltipVisible()

      expect(
        screen.getByTestId('hash_edit-tooltip-regular-field'),
      ).toHaveTextContent(TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA)

      fireEvent.click(editButton)
      expect(
        queryByTestId('hash_value-editor-regular-field'),
      ).not.toBeInTheDocument()
    })

    it('should disable editing value when entry field is truncated', async () => {
      const { queryByTestId } = render(
        <HashDetailsTable {...instance(mockedProps)} />,
      )

      // check edit action
      const hashValue = screen.getByTestId(
        `hash_content-value-${MOCK_TRUNCATED_STRING_VALUE}`,
      )

      await act(async () => {
        fireEvent.mouseEnter(hashValue)
      })

      const editButton = screen.getByTestId(
        `hash_edit-btn-${MOCK_TRUNCATED_STRING_VALUE}`,
      )
      expect(editButton).toBeDisabled()

      await act(async () => {
        fireEvent.focus(editButton)
      })
      await waitForRiTooltipVisible()

      expect(
        screen.getByTestId(`hash_edit-tooltip-${MOCK_TRUNCATED_STRING_VALUE}`),
      ).toHaveTextContent(TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA)

      fireEvent.click(editButton)
      expect(
        queryByTestId(`hash_value-editor-${MOCK_TRUNCATED_STRING_VALUE}`),
      ).not.toBeInTheDocument()
    })

    it('should disable editing ttl when entry field is truncated', async () => {
      render(
        <HashDetailsTable {...instance(mockedProps)} isExpireFieldsAvailable />,
      )

      const ttl = screen.getByTestId(
        `hash-ttl_content-value-${MOCK_TRUNCATED_STRING_VALUE}`,
      )

      await act(async () => {
        fireEvent.mouseEnter(ttl)
      })

      const editTtlButton = screen.getByTestId(
        `hash-ttl_edit-btn-${MOCK_TRUNCATED_STRING_VALUE}`,
      )

      expect(editTtlButton).toBeDisabled()

      await act(async () => {
        fireEvent.focus(editTtlButton)
      })
      await waitForRiTooltipVisible()

      expect(
        screen.getByTestId(
          `hash-ttl_edit-tooltip-${MOCK_TRUNCATED_STRING_VALUE}`,
        ),
      ).toHaveTextContent(TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA)
    })
  })
})
