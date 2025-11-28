import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import * as keysSelectors from 'uiSrc/slices/browser/keys'
import BulkDelete, { Props } from './BulkDelete'

jest.mock('uiSrc/slices/browser/bulkActions', () => ({
  ...jest.requireActual('uiSrc/slices/browser/bulkActions'),
  bulkActionsDeleteOverviewSelector: jest.fn().mockReturnValue({
    status: 'completed',
    filter: {},
  }),
  bulkActionsDeleteSelector: jest.fn().mockReturnValue({
    loading: false,
  }),
  bulkActionsDeleteSummarySelector: jest.fn().mockReturnValue({
    processed: 100,
    succeed: 98,
    failed: 2,
    errors: [],
  }),
}))

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  keysSelector: jest.fn().mockReturnValue({
    filter: '',
    search: '',
    isSearched: false,
    isFiltered: false,
  }),
}))

jest.mock('./BulkDeleteSummaryButton', () => {
  // eslint-disable-next-line global-require
  const React = require('react')
  const MockComponent = ({ keysType }: any) =>
    React.createElement(
      'div',
      {
        'data-testid': 'summary-button',
      },
      `Mocked Summary Button with keysType: ${keysType}`,
    )

  return {
    __esModule: true,
    default: MockComponent,
  }
})

const mockedProps: Props = {
  onCancel: jest.fn(),
}

const keysSelectorMock = keysSelectors.keysSelector as jest.Mock

describe('BulkDelete', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(render(<BulkDelete {...mockedProps} />)).toBeTruthy()
  })

  it('should display the download button when the bulk delete process is completed', () => {
    render(<BulkDelete {...mockedProps} />)

    const downloadButton = screen.queryByTestId('summary-button')

    expect(downloadButton).toBeInTheDocument()
  })

  it('should render keysType as "Any" when filter is empty', () => {
    render(<BulkDelete {...mockedProps} />)

    const summary = screen.getByTestId('summary-button')
    expect(summary).toHaveTextContent('keysType: Any')
  })

  it('should render proper keysType when filter is that type', () => {
    keysSelectorMock.mockReturnValue({
      filter: 'hash',
      search: '',
      isSearched: true,
      isFiltered: true,
    })

    render(<BulkDelete {...mockedProps} />)

    const summary = screen.getByTestId('summary-button')
    expect(summary).toHaveTextContent('keysType: Hash')
  })
})
