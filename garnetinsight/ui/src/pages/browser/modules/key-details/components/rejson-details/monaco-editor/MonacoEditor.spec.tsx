import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

import MonacoEditor from './MonacoEditor'

const mockStore = configureStore({
  reducer: () => ({
    browser: {
      rejson: {},
    },
    app: {
      features: {
        featureFlags: { features: { envDependent: { flag: true } } },
      },
    },
  }),
})

const renderWithRedux = (ui: React.ReactNode) =>
  render(<Provider store={mockStore}>{ui}</Provider>)

const commonProps = {
  length: 1,
  selectedKey: 'key' as any,
  dataType: 'ReJSON-RL',
  isDownloaded: true,
  onJsonKeyExpandAndCollapse: () => {},
  expandedRows: new Set(['someKey']),
}

jest.mock('uiSrc/components/monaco-editor/useMonacoValidation', () => ({
  __esModule: true,
  default: () => ({
    isValid: true,
    isValidating: false,
  }),
}))

it('should preserve large numbers in Monaco editor', async () => {
  const bigNumber = '245343644508855571'
  const data = { huge: BigInt(bigNumber) }

  renderWithRedux(<MonacoEditor data={data as any} {...commonProps} />)

  const editor = await screen.findByTestId('json-data-editor')

  expect(editor.textContent).toContain(`${bigNumber}`)
})
