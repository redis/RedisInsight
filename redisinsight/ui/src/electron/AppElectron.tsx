import React from 'react'
import App from 'uiSrc/App'
import Router from 'uiSrc/RouterElectron'
import { ConfigElectron, ConfigOAuth, ConfigAzureSso } from './components'

const AppElectron = () => (
  <Router>
    <App>
      <ConfigElectron />
      <ConfigOAuth />
      <ConfigAzureSso />
    </App>
  </Router>
)

export default AppElectron
