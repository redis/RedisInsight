import React, { useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  EDIT_INSTANCE_QUERY_PARAM,
  FOCUS_FIELD_QUERY_PARAM,
} from 'uiSrc/constants'
import {
  clusterSelector,
  resetDataRedisCluster,
  resetInstancesRedisCluster,
} from 'uiSrc/slices/instances/cluster'
import { setTitle } from 'uiSrc/utils'
import { HomePageTemplate } from 'uiSrc/templates'
import { resetKeys } from 'uiSrc/slices/browser/keys'
import {
  resetCliHelperSettings,
  resetCliSettingsAction,
} from 'uiSrc/slices/cli/cli-settings'
import { resetRedisearchKeysData } from 'uiSrc/slices/browser/redisearch'
import {
  appContextSelector,
  setAppContextInitialState,
} from 'uiSrc/slices/app/context'
import { Instance } from 'uiSrc/slices/interfaces'
import {
  cloudSelector,
  resetDataRedisCloud,
  resetSubscriptionsRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import {
  editedInstanceSelector,
  fetchEditedInstanceAction,
  fetchInstancesAction,
  instancesSelector,
  resetImportInstances,
  setEditedInstance,
} from 'uiSrc/slices/instances/instances'
import { fetchTags } from 'uiSrc/slices/instances/tags'
import {
  resetDataSentinel,
  sentinelSelector,
} from 'uiSrc/slices/instances/sentinel'
import { fetchContentAction as fetchCreateRedisButtonsAction } from 'uiSrc/slices/content/create-redis-buttons'
import {
  sendEventTelemetry,
  sendPageViewTelemetry,
  TelemetryEvent,
  TelemetryPageView,
} from 'uiSrc/telemetry'
import {
  appRedirectionSelector,
  setUrlHandlingInitialState,
} from 'uiSrc/slices/app/url-handling'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'

import { Page, PageBody } from 'uiSrc/components/base/layout/page'
import { Card } from 'uiSrc/components/base/layout'
import DatabasesList from './components/databases-list/DatabasesList'
import DatabaseListHeader from './components/database-list-header'
import EmptyMessage from './components/empty-message/EmptyMessage'
import DatabasePanelDialog from './components/database-panel-dialog'
import { ManageTagsModal } from './components/database-manage-tags-modal/ManageTagsModal'
import {
  HomePageDataProviderProvider,
  useHomePageDataProvider,
} from './contexts/HomePageDataProvider'

import './styles.scss'
import styles from './styles.module.scss'

enum OpenDialogName {
  AddDatabase = 'add',
  ManageTags = 'manage-tags',
  EditDatabase = 'edit',
}

const HomePage = () => {
  const { openDialog, setOpenDialog } = useHomePageDataProvider()

  const dispatch = useAppDispatch()

  const { credentials: clusterCredentials } = useAppSelector(clusterSelector)
  const { credentials: cloudCredentials } = useAppSelector(cloudSelector)
  const { instance: sentinelInstance } = useAppSelector(sentinelSelector)
  const { action, dbConnection } = useAppSelector(appRedirectionSelector)

  const {
    loading,
    loadingChanging,
    data: instances,
    changedSuccessfully: isChangedInstance,
    deletedSuccessfully: isDeletedInstance,
  } = useAppSelector(instancesSelector)

  const { data: editedInstance } = useAppSelector(editedInstanceSelector)

  const { contextInstanceId } = useAppSelector(appContextSelector)

  const history = useHistory()
  const { search } = useLocation()

  const hideDbList = instances.length === 0 && !loading && !loadingChanging

  useEffect(() => {
    setTitle('Redis databases')

    dispatch(fetchInstancesAction(handleOpenPage))
    dispatch(resetInstancesRedisCluster())
    dispatch(resetSubscriptionsRedisCloud())
    dispatch(fetchCreateRedisButtonsAction())
    dispatch(fetchTags())

    return () => {
      dispatch(setEditedInstance(null))
    }
  }, [])

  useEffect(() => {
    if (isDeletedInstance) {
      dispatch(fetchInstancesAction())
    }
  }, [isDeletedInstance])

  useEffect(() => {
    if (isChangedInstance) {
      setOpenDialog(null)
      dispatch(setEditedInstance(null))
    }
  }, [isChangedInstance])

  useEffect(() => {
    if (clusterCredentials || cloudCredentials || sentinelInstance) {
      setOpenDialog(OpenDialogName.AddDatabase)
    }
  }, [clusterCredentials, cloudCredentials, sentinelInstance])

  useEffect(() => {
    if (action === UrlHandlingActions.Connect) {
      setOpenDialog(OpenDialogName.AddDatabase)
    }
  }, [action, dbConnection])

  useEffect(() => {
    if (editedInstance) {
      const found = instances.find(
        (item: Instance) => item.id === editedInstance.id,
      )
      if (found) {
        dispatch(fetchEditedInstanceAction(found))
      }
    }
  }, [instances])

  // Open the edit-database dialog when deep-linked via `?editInstance=<id>`
  // (e.g. from the production-mode CTA, or the encryption-error flow). Any
  // `focusField` param is left for the relevant field component to consume.
  useEffect(() => {
    const params = new URLSearchParams(search)
    const editInstanceId = params.get(EDIT_INSTANCE_QUERY_PARAM)
    if (!editInstanceId || !instances.length) {
      return
    }

    const found = instances.find((item: Instance) => item.id === editInstanceId)
    if (found) {
      dispatch(fetchEditedInstanceAction(found))
      setOpenDialog(OpenDialogName.EditDatabase)
      // Consume the id param so closing the dialog can't reopen it on re-render.
      params.delete(EDIT_INSTANCE_QUERY_PARAM)
      history.replace({ search: params.toString() })
    }
  }, [search, instances])

  const handleOpenPage = (instances: Instance[]) => {
    const instancesWithTagsCount = instances.filter(
      (instance) => instance.tags && instance.tags.length > 0,
    ).length

    sendPageViewTelemetry({
      name: TelemetryPageView.DATABASES_LIST_PAGE,
      eventData: {
        instancesCount: instances.length,
        instancesWithTagsCount,
      },
    })
  }

  const onDbEdited = () => {
    if (contextInstanceId && contextInstanceId === editedInstance?.id) {
      dispatch(resetKeys())
      dispatch(resetRedisearchKeysData())
      dispatch(resetCliSettingsAction())
      dispatch(resetCliHelperSettings())
      dispatch(setAppContextInitialState())
    }
  }

  const closeEditDialog = () => {
    dispatch(setEditedInstance(null))
    setOpenDialog(null)

    // Drop a leftover focus param (if the field component never consumed it)
    // so a later edit can't auto-open that field.
    const params = new URLSearchParams(search)
    if (params.has(FOCUS_FIELD_QUERY_PARAM)) {
      params.delete(FOCUS_FIELD_QUERY_PARAM)
      history.replace({ search: params.toString() })
    }

    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_EDIT_CANCELLED_CLICKED,
      eventData: {
        databaseId: editedInstance?.id,
      },
    })
  }

  const handleClose = () => {
    dispatch(resetDataRedisCluster())
    dispatch(resetDataSentinel())
    dispatch(resetImportInstances())
    dispatch(resetDataRedisCloud())

    setOpenDialog(null)
    dispatch(setEditedInstance(null))

    if (action === UrlHandlingActions.Connect) {
      dispatch(setUrlHandlingInitialState())
    }

    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_ADD_FORM_DISMISSED,
    })
  }

  const handleAddInstance = () => {
    setOpenDialog(OpenDialogName.AddDatabase)
    dispatch(setEditedInstance(null))
  }

  return (
    <HomePageTemplate>
      <div className={styles.pageWrapper}>
        <Page className={styles.page}>
          <PageBody component="div">
            <DatabaseListHeader
              key="instance-controls"
              onAddInstance={handleAddInstance}
            />
            {openDialog && openDialog !== OpenDialogName.ManageTags && (
              <DatabasePanelDialog
                editMode={openDialog === OpenDialogName.EditDatabase}
                urlHandlingAction={action}
                editedInstance={
                  openDialog === OpenDialogName.EditDatabase
                    ? editedInstance
                    : (sentinelInstance ?? null)
                }
                onClose={
                  openDialog === OpenDialogName.EditDatabase
                    ? closeEditDialog
                    : handleClose
                }
                onDbEdited={onDbEdited}
              />
            )}
            {openDialog === OpenDialogName.ManageTags && editedInstance && (
              <ManageTagsModal
                instance={editedInstance}
                onClose={handleClose}
              />
            )}
            <div key="homePage" className="homePage">
              {hideDbList && (
                <Card>
                  <EmptyMessage onAddInstanceClick={handleAddInstance} />
                </Card>
              )}
              {!hideDbList && <DatabasesList />}
            </div>
          </PageBody>
        </Page>
      </div>
    </HomePageTemplate>
  )
}

const HomePageWithProvider = () => (
  <HomePageDataProviderProvider>
    <HomePage />
  </HomePageDataProviderProvider>
)

export default HomePageWithProvider
