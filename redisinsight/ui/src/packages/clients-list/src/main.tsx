/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import { ThemeProvider } from 'uiSrc/components/base/utils/pluginsThemeContext'
import App, { CommonPlugin, RawMode } from './App'
import './styles/styles.scss'

interface Props {
  command?: string
  mode: RawMode
  data?: { response: any; status: string }[]
}

const renderClientsList = (props: Props) => {
  const { command = '', data: result = [], mode } = props
  render(
    <ThemeProvider>
      <App
        plugin={CommonPlugin.ClientList}
        command={command}
        result={result}
        mode={mode}
      />
    </ThemeProvider>,
    document.getElementById('app'),
  )
}

const renderJSON = (props: Props) => {
  const { command = '', data: result = [], mode } = props

  render(
    <ThemeProvider>
      <App
        plugin={CommonPlugin.JSON}
        command={command}
        result={result}
        mode={mode}
      />
    </ThemeProvider>,
    document.getElementById('app'),
  )
}

if (process.env.NODE_ENV === 'development') {
  // renderClientsList({ command: '', data: result || [] })
  const mode = RawMode.RAW

  const data = [
    {
      status: 'success',
      // response: ['{\\"test\\":\\"test\\"}', '{\\"foo\\":\\"bar\\"}']
      response: '[{"about":"test\\r\\n"}]',
    },
  ]

  renderJSON({ command: '', data, mode })
}

// This is a required action - export the main function for execution of the visualization
export default { renderClientsList, renderJSON }
