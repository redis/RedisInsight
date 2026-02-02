import React from 'react'
import App from 'uiSrc/App'
import Router from 'uiSrc/RouterElectron'
import { ConfigElectron, ConfigOAuth, ConfigAzureAuth } from './components'

const AppElectron = () => (
  <Router>
    <App>
      <ConfigElectron />
      <ConfigOAuth />
      <ConfigAzureAuth />
    </App>
  </Router>
)

export default AppElectron
