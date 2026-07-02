import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { appServerInfoSelector } from 'uiSrc/slices/app/info'
import { handleCopy } from 'uiSrc/utils'
import { GetServerInfoResponseFactory } from 'uiSrc/mocks/factories/app/GetServerInfoResponse.factory'

import { CopyDiagnostics } from './CopyDiagnostics'
import { formatDiagnostics } from './formatDiagnostics'

jest.mock('uiSrc/slices/app/info', () => ({
  ...jest.requireActual('uiSrc/slices/app/info'),
  appServerInfoSelector: jest.fn().mockReturnValue(null),
}))

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  handleCopy: jest.fn(),
}))

const mockedHandleCopy = jest.mocked(handleCopy)

const renderComponent = (
  server: unknown = GetServerInfoResponseFactory.build(),
) => {
  ;(appServerInfoSelector as jest.Mock).mockReturnValue(server)
  return render(<CopyDiagnostics />)
}

describe('CopyDiagnostics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the copy diagnostics control when server info is available', () => {
    renderComponent()

    expect(screen.getByText('Copy system info')).toBeInTheDocument()
    expect(screen.getByTestId('copy-diagnostics-btn')).toBeInTheDocument()
  })

  it('should copy the formatted diagnostics to clipboard when clicked', () => {
    const server = GetServerInfoResponseFactory.build()
    renderComponent(server)

    fireEvent.click(screen.getByTestId('copy-diagnostics-btn'))

    expect(mockedHandleCopy).toHaveBeenCalledWith(formatDiagnostics(server))
  })

  it('should not render when server info is null', () => {
    renderComponent(null)

    expect(screen.queryByTestId('copy-diagnostics-btn')).not.toBeInTheDocument()
  })

  it('should not render when appVersion is missing', () => {
    renderComponent({})

    expect(screen.queryByTestId('copy-diagnostics-btn')).not.toBeInTheDocument()
  })
})
