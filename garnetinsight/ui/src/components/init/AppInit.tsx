import React, { ReactElement, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  appInitSelector,
  initializeAppAction,
  STATUS_FAIL,
  STATUS_SUCCESS,
} from 'uiSrc/slices/app/init'
import { removePagePlaceholder } from 'uiSrc/utils'
import ConnectivityError from 'uiSrc/components/connectivity-error/ConnectivityError'
import SuspenseLoader from 'uiSrc/components/main-router/components/SuspenseLoader'

type Props = {
  children: ReactElement
  onSuccess?: () => void
  onFail?: () => void
}

const AppInit = ({ children, onSuccess, onFail }: Props) => {
  const dispatch = useDispatch()
  const { status } = useSelector(appInitSelector)

  const initApp = useCallback(
    () => dispatch(initializeAppAction(onSuccess, onFail)),
    [onSuccess, onFail],
  )

  useEffect(() => {
    initApp()
  }, [])

  if (status === STATUS_FAIL) {
    removePagePlaceholder()
    return (
      <ConnectivityError
        isLoading={false}
        onRetry={initApp}
        error="An unexpected server error has occurred. Please retry the request."
      />
    )
  }

  return status === STATUS_SUCCESS ? children : <SuspenseLoader />
}

export default AppInit
