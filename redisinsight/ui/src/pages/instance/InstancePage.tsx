import React, { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useLocation, useParams } from 'react-router-dom'

import {
  checkConnectToInstanceAction,
  fetchConnectedInstanceAction,
  fetchConnectedInstanceInfoAction,
  fetchInstancesAction,
  getDatabaseConfigInfoAction,
  instancesSelector as dbInstancesSelector,
} from 'uiSrc/slices/instances/instances'
import {
  fetchInstancesAction as fetchRdiInstancesAction,
  instancesSelector as rdiInstancesSelector,
} from 'uiSrc/slices/rdi/instances'
import { fetchRecommendationsAction } from 'uiSrc/slices/recommendations/recommendations'
import {
  appContextSelector,
  resetDatabaseContext,
  setAppContextConnectedInstanceId,
  setDbConfig,
} from 'uiSrc/slices/app/context'
import { BrowserStorageItem, FeatureFlags } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { InstancePageTemplate } from 'uiSrc/templates'
import { getPageName } from 'uiSrc/utils/routing'
import { loadPluginsAction } from 'uiSrc/slices/app/plugins'
import { appConnectivityError } from 'uiSrc/slices/app/connectivity'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { getConfig } from 'uiSrc/config'
import InstancePageRouter from './InstancePageRouter'
import InstanceConnectionLost from './instanceConnectionLost'

const riConfig = getConfig()

const { shouldGetRecommendations, defaultTimeoutToGetRecommendations } =
  riConfig.database

export interface Props {
  routes: any[]
}

const InstancePage = ({ routes = [] }: Props) => {
  const [isShouldChildrenRerender, setIsShouldChildrenRerender] =
    useState(false)

  const dispatch = useAppDispatch()
  const { pathname } = useLocation()

  const { data: rdiInstances } = useAppSelector(rdiInstancesSelector)
  const { data: dbInstances } = useAppSelector(dbInstancesSelector)

  const { instanceId: connectionInstanceId } = useParams<{
    instanceId: string
  }>()
  const { contextInstanceId } = useAppSelector(appContextSelector)
  const connectivityError = useAppSelector(appConnectivityError)
  const { [FeatureFlags.envDependent]: envDependent } = useAppSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const lastPageRef = useRef<string>()

  useEffect(() => {
    if (!dbInstances?.length) {
      dispatch(fetchInstancesAction())
    }
    if (!rdiInstances?.length && envDependent?.flag) {
      dispatch(fetchRdiInstancesAction())
    }
  }, [])

  useEffect(() => {
    dispatch(loadPluginsAction())
  }, [])

  useEffect(() => {
    dispatch(
      checkConnectToInstanceAction(
        connectionInstanceId,
        () => {
          dispatch(fetchConnectedInstanceAction(connectionInstanceId))
          dispatch(getDatabaseConfigInfoAction(connectionInstanceId))
          dispatch(fetchConnectedInstanceInfoAction(connectionInstanceId))
          dispatch(fetchRecommendationsAction(connectionInstanceId))
        },
        undefined,
        contextInstanceId !== connectionInstanceId,
      ),
    )

    let intervalId: ReturnType<typeof setInterval>
    if (shouldGetRecommendations) {
      intervalId = setInterval(() => {
        dispatch(fetchRecommendationsAction(connectionInstanceId))
      }, defaultTimeoutToGetRecommendations)
    }

    if (contextInstanceId && contextInstanceId !== connectionInstanceId) {
      // rerender children only if the same page from scratch to clear all component states
      if (lastPageRef.current === getPageName(connectionInstanceId, pathname)) {
        setIsShouldChildrenRerender(true)
      }

      dispatch(resetDatabaseContext())
    }

    dispatch(setAppContextConnectedInstanceId(connectionInstanceId))
    dispatch(
      setDbConfig(
        localStorageService.get(
          BrowserStorageItem.dbConfig + connectionInstanceId,
        ),
      ),
    )

    return () => {
      intervalId && clearInterval(intervalId)
    }
  }, [connectionInstanceId])

  useEffect(() => {
    lastPageRef.current = getPageName(connectionInstanceId, pathname)
  }, [pathname])

  useEffect(() => {
    if (isShouldChildrenRerender) {
      dispatch(resetDatabaseContext())
      setIsShouldChildrenRerender(false)
    }
  }, [isShouldChildrenRerender])

  if (isShouldChildrenRerender) {
    return null
  }

  return (
    <InstancePageTemplate>
      {!envDependent?.flag && connectivityError ? (
        <InstanceConnectionLost />
      ) : (
        <InstancePageRouter routes={routes} />
      )}
    </InstancePageTemplate>
  )
}

export default InstancePage
