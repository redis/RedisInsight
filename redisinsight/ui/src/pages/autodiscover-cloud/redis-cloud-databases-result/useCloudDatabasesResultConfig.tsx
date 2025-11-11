import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import {
  cloudSelector,
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import { InstanceRedisCloud, LoadedCloud } from 'uiSrc/slices/interfaces'
import { setTitle } from 'uiSrc/utils'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  DatabaseResultColumn,
  SubscriptionIdResultColumn,
  SubscriptionDbResultColumn,
  SubscriptionTypeResultColumn,
  StatusDbResultColumn,
  EndpointResultColumn,
  ModulesResultColumn,
  OptionsResultColumn,
  MessageResultColumn,
} from '../column-definitions'

export const colFactory = (
  instances: InstanceRedisCloud[] = [],
  instancesForOptions: InstanceRedisCloud[] = [],
): ColumnDef<InstanceRedisCloud>[] => {
  const shouldShowCapabilities = instances.some(
    (instance) => instance.modules?.length,
  )
  const shouldShowOptions = instances.some(
    (instance) =>
      instance.options &&
      Object.values(instance.options).filter(Boolean).length,
  )
  const columns: ColumnDef<InstanceRedisCloud>[] = [
    DatabaseResultColumn(),
    SubscriptionIdResultColumn(),
    SubscriptionDbResultColumn(),
    SubscriptionTypeResultColumn(),
    StatusDbResultColumn(),
    EndpointResultColumn(),
    ModulesResultColumn(),
    OptionsResultColumn(instancesForOptions),
    MessageResultColumn(),
  ]

  if (!shouldShowCapabilities) {
    columns.splice(
      columns.findIndex((col) => col.id === 'modules'),
      1,
    )
  }

  if (!shouldShowOptions) {
    columns.splice(
      columns.findIndex((col) => col.id === 'options'),
      1,
    )
  }

  return columns
}

export const useCloudDatabasesResultConfig = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const { data: instancesForOptions, dataAdded: instances } =
    useSelector(cloudSelector)

  useEffect(() => {
    if (!instances.length) {
      history.push(Pages.home)
    }
    setTitle('Redis Enterprise Databases Added')
  }, [instances.length])

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
