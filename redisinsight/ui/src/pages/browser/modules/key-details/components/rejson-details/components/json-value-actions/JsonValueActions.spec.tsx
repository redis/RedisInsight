import React from 'react'

import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { handleCopy, stringToBuffer } from 'uiSrc/utils'
import { fetchDownloadJsonValue } from 'uiSrc/slices/browser/rejson'
import { downloadFile } from 'uiSrc/utils/dom/downloadFile'
import JsonValueActions, { Props } from './JsonValueActions'

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  handleCopy: jest.fn(),
}))

jest.mock('uiSrc/slices/browser/rejson', () => ({
  ...jest.requireActual('uiSrc/slices/browser/rejson'),
  fetchDownloadJsonValue: jest.fn(() => ({
    type: 'rejson/fetchDownloadJsonValue',
  })),
}))

const mockedHandleCopy = jest.mocked(handleCopy)
const mockedFetchDownload = jest.mocked(fetchDownloadJsonValue)

const selectedKey = stringToBuffer('json:key')

const renderComponent = (props: Partial<Props> = {}) =>
  render(
    <JsonValueActions
      data={{ a: 1 }}
      selectedKey={selectedKey}
      isDownloaded
      {...props}
    />,
  )

describe('JsonValueActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the copy button when the value is fully downloaded', () => {
    renderComponent({ isDownloaded: true })

    expect(screen.getByTestId('copy-json-value-btn')).toBeInTheDocument()
    expect(screen.queryByTestId('download-json-value')).not.toBeInTheDocument()
  })

  it('should copy the pretty-printed value when clicked', () => {
    renderComponent({ isDownloaded: true, data: { a: 1 } })

    fireEvent.click(screen.getByTestId('copy-json-value-btn'))

    expect(mockedHandleCopy).toHaveBeenCalledWith(
      JSON.stringify({ a: 1 }, null, 2),
    )
  })

  it('should render the download button when the value is not fully downloaded', () => {
    renderComponent({ isDownloaded: false })

    expect(screen.getByTestId('download-json-value')).toBeInTheDocument()
    expect(screen.queryByTestId('copy-json-value-btn')).not.toBeInTheDocument()
  })

  it('should dispatch fetchDownloadJsonValue when the download button is clicked', () => {
    renderComponent({ isDownloaded: false })

    fireEvent.click(screen.getByTestId('download-json-value'))

    expect(mockedFetchDownload).toHaveBeenCalledWith(
      selectedKey,
      '$',
      downloadFile,
    )
  })

  it('should render copy for a scalar root even when not downloaded', () => {
    // Scalar roots are fully loaded in memory even with downloaded === false.
    renderComponent({ data: 'big text' as any, isDownloaded: false })

    expect(screen.getByTestId('copy-json-value-btn')).toBeInTheDocument()
    expect(screen.queryByTestId('download-json-value')).not.toBeInTheDocument()
  })
})
