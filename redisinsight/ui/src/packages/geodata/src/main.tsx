/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import { ThemeProvider } from 'uiSrc/components/base/utils/pluginsThemeContext'

import App, { GeodataMode } from './App'
import { PluginProps } from './types'

import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import './styles/styles.scss'

const renderApp = (props: PluginProps, mode: GeodataMode): void => {
  const app = document.getElementById('app')
  if (!app) {
    console.error('[geodata-plugin] Cannot render without #app element')
    return
  }

  try {
    render(
      <ThemeProvider>
        <App {...props} mode={mode} />
      </ThemeProvider>,
      app,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown render error'
    console.error('[geodata-plugin] Render error:', error)
    app.textContent = `Geodata plugin error: ${message}`
  }
}

const renderGeoMapMarkers = (props: PluginProps): void => {
  renderApp(props, GeodataMode.Markers)
}

const renderGeoMapHeatmap = (props: PluginProps): void => {
  renderApp(props, GeodataMode.Heatmap)
}

const renderGeoInspector = (props: PluginProps): void => {
  renderApp(props, GeodataMode.Inspector)
}

const renderRqeGeoMap = (props: PluginProps): void => {
  renderApp(props, GeodataMode.RqeMarkers)
}

const renderRqeGeoHeatmap = (props: PluginProps): void => {
  renderApp(props, GeodataMode.RqeHeatmap)
}

const renderRqeGeoInspector = (props: PluginProps): void => {
  renderApp(props, GeodataMode.RqeInspector)
}

const renderRqeGeoShape = (props: PluginProps): void => {
  renderApp(props, GeodataMode.RqeShape)
}

if (process.env.NODE_ENV === 'development') {
  renderGeoInspector({
    command: 'GEOPOS Sicily Palermo Catania',
    data: [
      {
        status: 'success',
        response: [
          ['13.361389', '38.115556'],
          ['15.087269', '37.502669'],
        ],
      },
    ],
  })
}

export default {
  renderGeoMapMarkers,
  renderGeoMapHeatmap,
  renderGeoInspector,
  renderRqeGeoMap,
  renderRqeGeoHeatmap,
  renderRqeGeoInspector,
  renderRqeGeoShape,
}
