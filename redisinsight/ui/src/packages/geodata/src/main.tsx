/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import { ThemeProvider } from 'uiSrc/components/base/utils/pluginsThemeContext'

import App from './App'
import { GeodataMode, PluginProps } from './types'

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

const renderRedisSearchGeoMap = (props: PluginProps): void => {
  renderApp(props, GeodataMode.RedisSearchMarkers)
}

const renderRedisSearchGeoHeatmap = (props: PluginProps): void => {
  renderApp(props, GeodataMode.RedisSearchHeatmap)
}

const renderRedisSearchGeoInspector = (props: PluginProps): void => {
  renderApp(props, GeodataMode.RedisSearchInspector)
}

const renderRedisSearchGeoShape = (props: PluginProps): void => {
  renderApp(props, GeodataMode.RedisSearchShape)
}

if (process.env.NODE_ENV === 'development') {
  // Allow switching the plugin theme via `?theme=light` / `?theme=dark` so the
  // dev server can be screenshotted in both themes without editing index.html.
  const themeParam = new URLSearchParams(window.location.search).get('theme')
  if (themeParam === 'light') {
    document.body.className = 'theme_LIGHT'
  } else if (themeParam === 'dark') {
    document.body.className = 'theme_DARK'
  }

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
  renderRedisSearchGeoMap,
  renderRedisSearchGeoHeatmap,
  renderRedisSearchGeoInspector,
  renderRedisSearchGeoShape,
}
