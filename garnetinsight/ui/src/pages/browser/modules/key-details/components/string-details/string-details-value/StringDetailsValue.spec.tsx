import React from 'react'
import { instance, mock } from 'ts-mockito'
import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import {
  fetchDownloadStringValue,
  stringDataSelector,
} from 'uiSrc/slices/browser/string'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { anyToBuffer, bufferToString } from 'uiSrc/utils'
import { render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'
import {
  GZIP_COMPRESSED_VALUE_1,
  GZIP_COMPRESSED_VALUE_2,
  DECOMPRESSED_VALUE_STR_1,
  DECOMPRESSED_VALUE_STR_2,
} from 'uiSrc/utils/tests/decompressors'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { downloadFile } from 'uiSrc/utils/dom/downloadFile'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { MOCK_TRUNCATED_BUFFER_VALUE } from 'uiSrc/mocks/data/bigString'
import { StringDetailsValue, Props } from './StringDetailsValue'

const STRING_VALUE = 'string-value'
const STRING_VALUE_SPACE = 'string value'
const LOAD_ALL_BTN = 'load-all-value-btn'
const DOWNLOAD_BTN = 'download-all-value-btn'

const STRING_MAX_LENGTH = 2
const STRING_LENGTH = 4

const fullValue = { type: 'Buffer', data: [49, 50, 51, 52] }
const partValue = { type: 'Buffer', data: [49, 50] }

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/browser/string', () => ({
  ...jest.requireActual('uiSrc/slices/browser/string'),
  stringDataSelector: jest.fn().mockReturnValue({
    value: fullValue,
  }),
  fetchDownloadStringValue: jest.fn(),
}))

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  selectedKeyDataSelector: jest.fn().mockReturnValue({
    name: fullValue,
    type: 'string',
    length: STRING_LENGTH,
  }),
  selectedKeySelector: jest.fn(),
}))

jest.mock('uiSrc/constants', () => ({
  ...jest.requireActual('uiSrc/constants'),
  STRING_MAX_LENGTH,
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    compressor: null,
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn().mockReturnValue(() => jest.fn()),
}))

beforeEach(async () => {
  const selectedKeySelectorMock = jest.fn().mockReturnValue({
    viewFormat: KeyValueFormat.Unicode,
  })
  ;(selectedKeySelector as jest.Mock).mockImplementation(
    selectedKeySelectorMock,
  )
})

describe('StringDetailsValue', () => {
  it('should render', () => {
    expect(
      render(<StringDetailsValue {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should render textarea if edit mode', () => {
    render(
      <StringDetailsValue
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={jest.fn()}
      />,
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    expect(textArea).toBeInTheDocument()
  })

  it('should update string value', () => {
    render(
      <StringDetailsValue
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={jest.fn()}
      />,
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    fireEvent.change(textArea, { target: { value: STRING_VALUE_SPACE } })
    expect(textArea).toHaveValue(STRING_VALUE_SPACE)
  })

  it('should stay empty string after cancel', async () => {
    render(
      <StringDetailsValue
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={jest.fn()}
      />,
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    fireEvent.change(textArea, { target: { value: STRING_VALUE_SPACE } })
    const btnACancel = screen.getByTestId('cancel-btn')
    await act(() => {
      fireEvent.click(btnACancel)
    })
    const textArea2 = screen.getByTestId(STRING_VALUE)
    expect(textArea2).toHaveValue(bufferToString(fullValue))
  })

  it('should update value after apply', () => {
    render(
      <StringDetailsValue
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={jest.fn()}
      />,
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    fireEvent.change(textArea, { target: { value: STRING_VALUE_SPACE } })
    const btnApply = screen.getByTestId('apply-btn')
    fireEvent.click(btnApply)
    expect(textArea).toHaveValue(STRING_VALUE_SPACE)
  })

  it('should render load button and download button if long string is partially loaded', () => {
    const stringDataSelectorMock = jest.fn().mockReturnValue({
      value: partValue,
    })
    stringDataSelector.mockImplementation(stringDataSelectorMock)

    render(<StringDetailsValue {...instance(mockedProps)} />)
    const loadAllBtn = screen.getByTestId(LOAD_ALL_BTN)
    const downloadBtn = screen.getByTestId(DOWNLOAD_BTN)
    expect(loadAllBtn).toBeInTheDocument()
    expect(downloadBtn).toBeInTheDocument()
  })

  it('should call onRefresh and sendEventTelemetry after clicking on load button', () => {
    const onRefresh = jest.fn()
    const stringDataSelectorMock = jest.fn().mockReturnValue({
      value: partValue,
    })
    stringDataSelector.mockImplementation(stringDataSelectorMock)

    render(
      <StringDetailsValue {...instance(mockedProps)} onRefresh={onRefresh} />,
    )

    fireEvent.click(screen.getByTestId(LOAD_ALL_BTN))

    expect(onRefresh).toBeCalled()
    expect(onRefresh).toBeCalledWith(fullValue, 'string', {
      end: STRING_MAX_LENGTH + 1,
    })
    expect(sendEventTelemetry).toBeCalled()
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.STRING_LOAD_ALL_CLICKED,
      eventData: { databaseId: undefined, length: STRING_LENGTH },
    })
  })

  it('Should add "..." in the end of the part value', async () => {
    const stringDataSelectorMock = jest.fn().mockReturnValue({
      value: partValue,
    })
    stringDataSelector.mockImplementation(stringDataSelectorMock)

    render(<StringDetailsValue {...instance(mockedProps)} />)
    expect(screen.getByTestId(STRING_VALUE)).toHaveTextContent(
      `${bufferToString(partValue)}...`,
    )
  })

  it('Should render partValue in the Unicode format', async () => {
    const stringDataSelectorMock = jest.fn().mockReturnValue({
      // vector value
      value: anyToBuffer(new Float32Array([1.0]).buffer),
    })
    const selectedKeySelectorMock = jest.fn().mockReturnValue({
      viewFormat: KeyValueFormat.Vector32Bit,
    })
    ;(selectedKeySelector as jest.Mock).mockImplementation(
      selectedKeySelectorMock,
    )
    ;(stringDataSelector as jest.Mock).mockImplementation(
      stringDataSelectorMock,
    )

    render(<StringDetailsValue {...instance(mockedProps)} />)
    expect(screen.getByTestId(STRING_VALUE)).toHaveTextContent('�?...')
    expect(screen.getByTestId(STRING_VALUE)).not.toHaveTextContent(
      '[object Object]',
    )
  })

  it('Should not add "..." in the end of the full value', async () => {
    const stringDataSelectorMock = jest.fn().mockReturnValue({
      value: fullValue,
    })
    stringDataSelector.mockImplementation(stringDataSelectorMock)

    render(<StringDetailsValue {...instance(mockedProps)} />)
    expect(screen.getByTestId(STRING_VALUE)).toHaveTextContent(
      bufferToString(fullValue),
    )
  })

  it('should call fetchDownloadStringValue and sendEventTelemetry after clicking on load button and download button', async () => {
    const stringDataSelectorMock = jest.fn().mockReturnValue({
      value: partValue,
    })
    stringDataSelector.mockImplementation(stringDataSelectorMock)

    render(<StringDetailsValue {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId(DOWNLOAD_BTN))

    expect(sendEventTelemetry).toBeCalled()
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.STRING_DOWNLOAD_VALUE_CLICKED,
      eventData: { databaseId: undefined, length: STRING_LENGTH },
    })
    expect(fetchDownloadStringValue).toBeCalled()
    expect(fetchDownloadStringValue).toBeCalledWith(fullValue, downloadFile)
  })

  describe('decompressed  data', () => {
    it('should render decompressed GZIP data = "1"', () => {
      const stringDataSelectorMock = jest.fn().mockReturnValue({
        value: anyToBuffer(GZIP_COMPRESSED_VALUE_1),
      })
      stringDataSelector.mockImplementation(stringDataSelectorMock)

      connectedInstanceSelector.mockImplementation(() => ({
        compressor: KeyValueCompressor.GZIP,
      }))

      render(
        <StringDetailsValue
          {...instance(mockedProps)}
          isEditItem
          setIsEdit={jest.fn()}
        />,
      )
      const textArea = screen.getByTestId(STRING_VALUE)

      expect(textArea).toHaveValue(DECOMPRESSED_VALUE_STR_1)
    })

    it('should render decompressed GZIP data = "2"', () => {
      const stringDataSelectorMock = jest.fn().mockReturnValue({
        value: anyToBuffer(GZIP_COMPRESSED_VALUE_2),
      })
      stringDataSelector.mockImplementation(stringDataSelectorMock)

      connectedInstanceSelector.mockImplementation(() => ({
        compressor: KeyValueCompressor.GZIP,
      }))

      render(
        <StringDetailsValue
          {...instance(mockedProps)}
          isEditItem
          setIsEdit={jest.fn()}
        />,
      )
      const textArea = screen.getByTestId(STRING_VALUE)

      expect(textArea).toHaveValue(DECOMPRESSED_VALUE_STR_2)
    })
  })

  describe('truncated data', () => {
    it('should hide download button when value is truncated', async () => {
      const stringDataSelectorMock = jest.fn().mockReturnValue({
        value: MOCK_TRUNCATED_BUFFER_VALUE,
      })
      stringDataSelector.mockImplementation(stringDataSelectorMock)

      render(<StringDetailsValue {...instance(mockedProps)} />)

      expect(screen.queryByTestId(DOWNLOAD_BTN)).not.toBeInTheDocument()
    })
  })
})
