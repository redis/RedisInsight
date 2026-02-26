import React from 'react'
import { createRoot } from 'react-dom/client'
import AppElectron from 'uiSrc/electron/AppElectron'
import SentryErrorBoundary from 'uiSrc/components/error-boundary/SentryErrorBoundary'
import { listenPluginsEvents } from 'uiSrc/plugins/pluginEvents'
import { migrateLocalStorageData } from 'uiSrc/services'
import { initSentry } from 'uiSrc/services/sentryElectron'
import 'uiSrc/styles/base/_fonts.scss'
import 'uiSrc/styles/main.scss'

window.app.sendWindowId((_e: any, windowId: string = '') => {
  window.windowId = windowId || window.windowId

  initSentry()
  migrateLocalStorageData()
  listenPluginsEvents()

  const rootEl = document.getElementById('root')
  const root = createRoot(rootEl!)
  root.render(
    <SentryErrorBoundary>
      <AppElectron />
    </SentryErrorBoundary>,
  )
})
