/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon'
import { icon as EuiIconArrowRight } from '@elastic/eui/es/components/icon/assets/arrow_right'
import { ThemeProvider } from 'uiSrc/components/base/utils/pluginsThemeContext'
import App from './App'

import './styles/styles.scss'
import result from '../mockData/resultTimeSeries.json'

appendIconComponentCache({
  arrowRight: EuiIconArrowRight,
})

interface Props {
  command?: string
  data?: { response: any; status: string }[]
}

const renderChart = (props: Props) => {
  const { command = '', data: result = [] } = props
  render(
    <ThemeProvider>
      <App command={command} result={result} />
    </ThemeProvider>,
    document.getElementById('app'),
  )
}

if (process.env.NODE_ENV === 'development') {
  const command = 'TS.RANGE bike_sales_3_per_day - + FILTER_BY_VALUE 3000 5000'
  renderChart({ command, data: result, mode: 'ASCII' })
}

// This is a required action - export the main function for execution of the visualization
export default { renderChart }
