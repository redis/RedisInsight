import React from 'react'

import {
  GeoInspector,
  GeoSearchVisualization,
  Message,
  RedisSearchGeoVisualization,
  Shell,
} from './components'
import { GeodataMode, PluginProps, WorkbenchResult } from './types'

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
      <Shell>
        <Message title="Command failed" variant="danger">
          {JSON.stringify(response)}
        </Message>
      </Shell>
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

  if (mode === GeodataMode.RedisSearchMarkers) {
    return (
      <RedisSearchGeoVisualization
        command={command}
        response={response}
        status={status}
        mode="markers"
      />
    )
  }

  if (mode === GeodataMode.RedisSearchHeatmap) {
    return (
      <RedisSearchGeoVisualization
        command={command}
        response={response}
        status={status}
        mode="heatmap"
      />
    )
  }

  if (mode === GeodataMode.RedisSearchInspector) {
    return (
      <RedisSearchGeoVisualization
        command={command}
        response={response}
        status={status}
        mode="inspector"
      />
    )
  }

  if (mode === GeodataMode.RedisSearchShape) {
    return (
      <RedisSearchGeoVisualization
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
