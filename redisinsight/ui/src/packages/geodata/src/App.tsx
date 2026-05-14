import React from 'react'

import { GeoInspector } from './components/GeoInspector'
import { GeoSearchVisualization } from './components/GeoSearchVisualization'
import { Message } from './components/Message'
import { PluginProps, WorkbenchResult } from './types'

export enum GeodataMode {
  Markers = 'markers',
  Heatmap = 'heatmap',
  Inspector = 'inspector',
}

interface AppProps extends PluginProps {
  mode: GeodataMode
}

const getFirstResult = (data: WorkbenchResult[] = []): WorkbenchResult => (
  data[0] || { response: [], status: 'unknown' }
)

const App = ({ command = '', data = [], mode }: AppProps) => {
  const { response, status } = getFirstResult(data)

  if (status === 'fail') {
    return (
      <div className="geodata-shell">
        <Message title="Command failed">{JSON.stringify(response)}</Message>
      </div>
    )
  }

  if (mode === GeodataMode.Markers) {
    return (
      <GeoSearchVisualization
        command={command}
        response={response}
        status={status}
        mode="markers"
      />
    )
  }

  if (mode === GeodataMode.Heatmap) {
    return (
      <GeoSearchVisualization
        command={command}
        response={response}
        status={status}
        mode="heatmap"
      />
    )
  }

  return <GeoInspector command={command} response={response} status={status} />
}

export default App
