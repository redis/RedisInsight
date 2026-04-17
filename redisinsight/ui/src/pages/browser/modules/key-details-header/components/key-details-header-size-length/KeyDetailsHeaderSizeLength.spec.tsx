import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import {
  userEvent,
  cleanup,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import * as keysSlice from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'
import { Props, KeyDetailsHeaderSizeLength } from './KeyDetailsHeaderSizeLength'

let store: typeof mockedStore

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  selectedKeyDataSelector: jest.fn(),
}))

const mockSelectedKeyDataSelector =
  keysSlice.selectedKeyDataSelector as jest.Mock

describe('KeyDetailsHeaderSizeLength', () => {
  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
  })

  it('should render normal size correctly', () => {
    mockSelectedKeyDataSelector.mockReturnValueOnce({
      type: 'string',
      size: 1024,
      length: 1,
    })

    render(
      <KeyDetailsHeaderSizeLength {...instance(mockedProps)} width={1920} />,
    )

    expect(screen.getByTestId('key-size-text')).toBeInTheDocument()
    expect(screen.queryByTestId('key-size-info-icon')).not.toBeInTheDocument()
  })

  it('should render too large size with warning icon and expected tooltip', async () => {
    mockSelectedKeyDataSelector.mockReturnValueOnce({
      type: 'string',
      size: -1,
      length: 1,
    })

    render(
      <KeyDetailsHeaderSizeLength {...instance(mockedProps)} width={1920} />,
    )

    expect(screen.getByTestId('key-size-info-icon')).toBeInTheDocument()

    const infoIcon = screen.getByTestId('key-size-info-icon')
    userEvent.hover(infoIcon)

    const tooltipText = await screen.findAllByText(
      'The key size is too large to run the MEMORY USAGE command, as it may lead to performance issues.',
    )
    expect(tooltipText[0]).toBeInTheDocument()
  })

  it('should render "Top-level values" label when type is json', () => {
    mockSelectedKeyDataSelector.mockReturnValueOnce({
      type: KeyTypes.ReJSON,
      size: 512,
      length: 5,
    })

    render(
      <KeyDetailsHeaderSizeLength {...instance(mockedProps)} width={1920} />,
    )

    expect(screen.getByTestId('key-length-text')).toHaveTextContent(
      'Top-level values: 5',
    )
  })

  it('should render quant type when provided', () => {
    mockSelectedKeyDataSelector.mockReturnValueOnce({
      type: KeyTypes.VectorSet,
      size: 1024,
      length: 5,
      quantType: 'int8',
    })

    render(
      <KeyDetailsHeaderSizeLength {...instance(mockedProps)} width={1920} />,
    )

    expect(screen.getByTestId('key-quant-type-text')).toHaveTextContent(
      'Quant type: int8',
    )
  })

  it('should render vector dim when provided', () => {
    mockSelectedKeyDataSelector.mockReturnValueOnce({
      type: KeyTypes.VectorSet,
      size: 1024,
      length: 5,
      vectorDim: 300,
    })

    render(
      <KeyDetailsHeaderSizeLength {...instance(mockedProps)} width={1920} />,
    )

    expect(screen.getByTestId('key-vector-dim-text')).toHaveTextContent(
      'Vector dim: 300',
    )
  })

  it('should not render quant type when not provided', () => {
    mockSelectedKeyDataSelector.mockReturnValueOnce({
      type: KeyTypes.VectorSet,
      size: 1024,
      length: 5,
    })

    render(
      <KeyDetailsHeaderSizeLength {...instance(mockedProps)} width={1920} />,
    )

    expect(screen.queryByTestId('key-quant-type-text')).not.toBeInTheDocument()
  })

  it('should not render vector dim when not provided', () => {
    mockSelectedKeyDataSelector.mockReturnValueOnce({
      type: KeyTypes.VectorSet,
      size: 1024,
      length: 5,
    })

    render(
      <KeyDetailsHeaderSizeLength {...instance(mockedProps)} width={1920} />,
    )

    expect(screen.queryByTestId('key-vector-dim-text')).not.toBeInTheDocument()
  })

  it('should render vector dim when value is 0', () => {
    mockSelectedKeyDataSelector.mockReturnValueOnce({
      type: KeyTypes.VectorSet,
      size: 1024,
      length: 5,
      vectorDim: 0,
    })

    render(
      <KeyDetailsHeaderSizeLength {...instance(mockedProps)} width={1920} />,
    )

    expect(screen.getByTestId('key-vector-dim-text')).toHaveTextContent(
      'Vector dim: 0',
    )
  })
})
