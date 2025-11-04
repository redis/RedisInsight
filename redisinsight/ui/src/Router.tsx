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

export const history = createBrowserHistory({ basename: MOUNT_PATH })

const Router = ({ children }: Props) => (
  <ReactRouter history={history}>{children}</ReactRouter>
)

export default Router
