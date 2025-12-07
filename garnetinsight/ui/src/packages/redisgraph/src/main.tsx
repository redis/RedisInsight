/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import { GraphApp, TableApp } from './App'
import { ThemeProvider } from 'uiSrc/components/base/utils/pluginsThemeContext'
import './styles/styles.scss'
import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon'
import { icon as EuiIconMagnifyWithPlus } from '@elastic/eui/es/components/icon/assets/magnifyWithPlus'
import { icon as EuiIconMagnifyWithMinus } from '@elastic/eui/es/components/icon/assets/magnifyWithMinus'
import { icon as EuiIconBullsEye } from '@elastic/eui/es/components/icon/assets/bullseye'
import { icon as EuiIconEditorItemAlignCenter } from '@elastic/eui/es/components/icon/assets/editorItemAlignCenter'
import result from './mockData/resultGraph.json'

interface Props {
  command?: string
  data?: { response: any; status: string }[]
}

appendIconComponentCache({
  magnifyWithPlus: EuiIconMagnifyWithPlus,
  magnifyWithMinus: EuiIconMagnifyWithMinus,
  bullseye: EuiIconBullsEye,
  editorItemAlignCenter: EuiIconEditorItemAlignCenter,
})

const renderApp = (element: JSX.Element) =>
  render(
    <ThemeProvider>{element}</ThemeProvider>,
    document.getElementById('app'),
  )

const renderGraphTable = (props: Props) =>
  renderApp(<TableApp data={props.data} command={props.command} />)

const renderGraph = (props: Props) =>
  renderApp(<GraphApp data={props.data} command={props.command} />)

if (process.env.NODE_ENV === 'development') {
  renderGraph({ data: result, command: 'graph' })
}

// This is a required action - export the main function for execution of the visualization
export default { renderGraphTable, renderGraph }
