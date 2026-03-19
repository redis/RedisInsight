/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import { ThemeProvider } from 'uiSrc/components/base/utils/pluginsThemeContext'
import App from './App'
import { PersistedTsChartConfig } from './components/Chart/interfaces'

import './styles/styles.scss'
import result from '../mockData/resultTimeSeries.json'

interface Props {
  command?: string
  data?: { response: any; status: string }[]
  initialPreferences?: {
    chartConfig?: PersistedTsChartConfig
  }
}

const renderChart = (props: Props) => {
  const { command = '', data: result = [], initialPreferences } = props
  render(
    <ThemeProvider>
      <App command={command} result={result} initialPreferences={initialPreferences} />
    </ThemeProvider>,
    document.getElementById('app'),
  )
}

if (process.env.NODE_ENV === 'development') {
  const command = 'TS.RANGE bike_sales_3_per_day - + FILTER_BY_VALUE 3000 5000'
  renderChart({ command, data: result })
}

// This is a required action - export the main function for execution of the visualization
export default { renderChart }
