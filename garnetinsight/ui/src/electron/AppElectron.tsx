import React from 'react'
import App from 'uiSrc/App'
import Router from 'uiSrc/RouterElectron'
import { ConfigElectron, ConfigOAuth } from './components'

const AppElectron = () => (
  <Router>
    <App>
      <ConfigElectron />
      <ConfigOAuth />
    </App>
  </Router>
)

export default AppElectron
