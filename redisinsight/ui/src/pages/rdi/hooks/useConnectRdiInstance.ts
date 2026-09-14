import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  appContextSelector,
  resetDatabaseContext,
  resetRdiContext,
  setAppContextConnectedRdiInstanceId,
  setLastPageContext,
} from 'uiSrc/slices/app/context'
import {
  connectedInstanceSelector,
  fetchConnectedInstanceAction,
  fetchInstancesAction as fetchRdiInstancesAction,
  instancesSelector as rdiInstancesSelector,
} from 'uiSrc/slices/rdi/instances'
import {
  fetchInstancesAction,
  instancesSelector as dbInstancesSelector,
  resetConnectedInstance as resetConnectedDatabaseInstance,
} from 'uiSrc/slices/instances/instances'

export const useConnectRdiInstance = (rdiInstanceId: string) => {
  const dispatch = useAppDispatch()
  const { contextRdiInstanceId } = useAppSelector(appContextSelector)
  const { data: rdiInstances } = useAppSelector(rdiInstancesSelector)
  const { data: dbInstances } = useAppSelector(dbInstancesSelector)
  const connectedInstance = useAppSelector(connectedInstanceSelector)

  useEffect(() => {
    if (!dbInstances?.length) {
      dispatch(fetchInstancesAction())
    }
    if (!rdiInstances?.length) {
      dispatch(fetchRdiInstancesAction())
    }
  }, [])

  useEffect(() => {
    if (!contextRdiInstanceId || contextRdiInstanceId !== rdiInstanceId) {
      dispatch(resetRdiContext())
      dispatch(setLastPageContext(''))
      dispatch(fetchConnectedInstanceAction(rdiInstanceId))
    }
    dispatch(setAppContextConnectedRdiInstanceId(rdiInstanceId))

    // clear database context
    dispatch(resetConnectedDatabaseInstance())
    dispatch(resetDatabaseContext())
  }, [rdiInstanceId])

  return { connectedInstance, contextRdiInstanceId }
}
