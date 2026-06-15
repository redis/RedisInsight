import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { Pages } from 'uiSrc/constants'

interface IProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children, ...rest }: IProps) => {
  const { id: connected } = useAppSelector(connectedInstanceSelector)
  return (
    <Route
      {...rest}
      render={() => (connected ? children : <Redirect to={Pages.home} />)}
    />
  )
}

export default ProtectedRoute
