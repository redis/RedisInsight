/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import { ThemeProvider } from 'uiSrc/components/base/utils/pluginsThemeContext'
import { App } from './App'
import './styles/styles.scss'

import data from '../test-data/result-explain-pd.json'
// import data from '../test-data/result-explain.json'
// import data from '../test-data/result-profile_r7.json'
// import data from '../test-data/result-profile_r7--aggregate.json'
// import data from '../test-data/result-profile_r8.json'

interface Props {
  command?: string
  data?: { response: any; status: string }[]
  mode?: string
}


const renderApp = (element: JSX.Element) =>
  render(element, document.getElementById('app'))

const renderCore = (props: Props) =>
  renderApp(
    <ThemeProvider>
      <App data={props.data} command={props.command} />
    </ThemeProvider>,
  )

if (process.env.NODE_ENV === 'development') {
  const command = "FT.EXPLAIN 'idx:bicycle' 'query to search'"
  // const command = 'FT.PROFILE \'idx:bicycle\' SEARCH QUERY \'*\' NOCONTENT'

  renderCore({ command, data, mode: 'ASCII' })
}

// This is a required action - export the main function for execution of the visualization
export default { renderCore }
