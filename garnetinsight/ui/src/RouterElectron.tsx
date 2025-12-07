import React from 'react'
import { HashRouter } from 'react-router-dom'

interface Props {
  children: React.ReactElement
}

const Router = ({ children }: Props) => <HashRouter>{children}</HashRouter>

export default Router
