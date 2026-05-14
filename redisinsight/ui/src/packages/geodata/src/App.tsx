import React from 'react'

import { GeoInspector } from './components/GeoInspector'
import { GeoSearchVisualization } from './components/GeoSearchVisualization'
import { Message } from './components/Message'
import { RqeGeoVisualization } from './components/RqeGeoVisualization'
import { PluginProps, WorkbenchResult } from './types'

export enum GeodataMode {
  Markers = 'markers',
  Heatmap = 'heatmap',
  Inspector = 'inspector',
  RqeMarkers = 'rqe-markers',
  RqeHeatmap = 'rqe-heatmap',
  RqeInspector = 'rqe-inspector',
  RqeShape = 'rqe-shape',
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

  if (mode === GeodataMode.RqeMarkers) {
    return (
      <RqeGeoVisualization
        command={command}
        response={response}
        status={status}
        mode="markers"
      />
    )
  }

  if (mode === GeodataMode.RqeHeatmap) {
    return (
      <RqeGeoVisualization
        command={command}
        response={response}
        status={status}
        mode="heatmap"
      />
    )
  }

  if (mode === GeodataMode.RqeInspector) {
    return (
      <RqeGeoVisualization
        command={command}
        response={response}
        status={status}
        mode="inspector"
      />
    )
  }

  if (mode === GeodataMode.RqeShape) {
    return (
      <RqeGeoVisualization
        command={command}
        response={response}
        status={status}
        mode="shape"
      />
    )
  }

  return <GeoInspector command={command} response={response} status={status} />
}

export default App
