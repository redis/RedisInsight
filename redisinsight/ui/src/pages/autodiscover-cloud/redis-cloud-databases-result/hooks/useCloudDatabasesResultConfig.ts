import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import {
  cloudSelector,
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import { LoadedCloud } from 'uiSrc/slices/interfaces'
import { setTitle } from 'uiSrc/utils'
import { colFactory } from '../utils/colFactory'
import { UseCloudDatabasesResultConfigReturn } from './useCloudDatabasesResultConfig.types'

export const useCloudDatabasesResultConfig =
  (): UseCloudDatabasesResultConfigReturn => {
    const dispatch = useDispatch()
    const history = useHistory()

    const { data: instancesForOptions, dataAdded: instances } =
      useSelector(cloudSelector)

    useEffect(() => {
      if (!instances.length) {
        history.push(Pages.home)
      }
      setTitle('Redis Enterprise Databases Added')
    }, [instances.length, history])

    const handleClose = useCallback(() => {
      dispatch(resetDataRedisCloud())
      history.push(Pages.home)
    }, [dispatch, history])

    const handleBackAdding = useCallback(() => {
      dispatch(resetLoadedRedisCloud(LoadedCloud.InstancesAdded))
      history.push(Pages.home)
    }, [dispatch, history])

    const columns = useMemo(
      () => colFactory(instances || [], instancesForOptions || []),
      [instances, instancesForOptions],
    )

    return {
      instances,
      columns,
      handleClose,
      handleBackAdding,
    }
  }
