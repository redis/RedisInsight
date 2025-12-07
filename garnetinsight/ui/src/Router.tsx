import React from 'react'
import { Router as ReactRouter } from 'react-router-dom'
import { createBrowserHistory } from 'history'

interface Props {
  children: React.ReactElement
}

const RIPROXYPATH = window.__RI_PROXY_PATH__ || ''

let MOUNT_PATH = '/'

if (RIPROXYPATH !== '') {
  MOUNT_PATH = RIPROXYPATH
}

const history = createBrowserHistory({ basename: MOUNT_PATH })

export const navigate = (path: string) => {
  if (window.location.hash) {
    // Electron (HashRouter)
    window.location.hash = `#${path}`
  } else {
    // Web (BrowserRouter)
    history.push(path)
  }
}

const Router = ({ children }: Props) => (
  <ReactRouter history={history}>{children}</ReactRouter>
)

export default Router
