import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RiPage, RiPageBody, RiCard } from 'uiBase/layout'
import {
  clusterSelector,
  resetDataRedisCluster,
  resetInstancesRedisCluster,
} from 'uiSrc/slices/instances/cluster'
import { Nullable, setTitle } from 'uiSrc/utils'
import { HomePageTemplate } from 'uiSrc/templates'
import { BrowserStorageItem, FeatureFlags } from 'uiSrc/constants'
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
import { localStorageService } from 'uiSrc/services'
import {
  resetDataSentinel,
  sentinelSelector,
} from 'uiSrc/slices/instances/sentinel'
import {
  contentSelector,
  fetchContentAction as fetchCreateRedisButtonsAction,
} from 'uiSrc/slices/content/create-redis-buttons'
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
import { CREATE_CLOUD_DB_ID } from 'uiSrc/pages/home/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'

import DatabasesList from './components/database-list-component'
import DatabaseListHeader from './components/database-list-header'
import EmptyMessage from './components/empty-message/EmptyMessage'
import DatabasePanelDialog from './components/database-panel-dialog'
import { ManageTagsModal } from './components/database-manage-tags-modal/ManageTagsModal'

import './styles.scss'
import styles from './styles.module.scss'

enum OpenDialogName {
  AddDatabase = 'add',
  ManageTags = 'manage-tags',
  EditDatabase = 'edit',
}

const HomePage = () => {
  const [openDialog, setOpenDialog] = useState<Nullable<OpenDialogName>>(null)

  const dispatch = useDispatch()

  const { credentials: clusterCredentials } = useSelector(clusterSelector)
  const { credentials: cloudCredentials } = useSelector(cloudSelector)
  const { instance: sentinelInstance } = useSelector(sentinelSelector)
  const { action, dbConnection } = useSelector(appRedirectionSelector)
  const { data: createDbContent } = useSelector(contentSelector)
  const {
    [FeatureFlags.enhancedCloudUI]: enhancedCloudUIFeature,
    [FeatureFlags.cloudAds]: cloudAdsFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)

  const {
    loading,
    loadingChanging,
    data: instances,
    changedSuccessfully: isChangedInstance,
    deletedSuccessfully: isDeletedInstance,
  } = useSelector(instancesSelector)

  const { data: editedInstance } = useSelector(editedInstanceSelector)

  const { contextInstanceId } = useSelector(appContextSelector)

  const predefinedInstances =
    enhancedCloudUIFeature?.flag &&
    cloudAdsFeature?.flag &&
    createDbContent?.cloud_list_of_databases
      ? [
          {
            id: CREATE_CLOUD_DB_ID,
            ...createDbContent.cloud_list_of_databases,
          } as Instance,
        ]
      : []
  const isInstanceExists =
    instances.length > 0 || predefinedInstances.length > 0

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

  const handleManageInstanceTags = (instance: Instance) => {
    dispatch(setEditedInstance(instance))
    setOpenDialog(OpenDialogName.ManageTags)
  }

  const handleEditInstance = (editedInstance: Instance) => {
    if (editedInstance) {
      dispatch(fetchEditedInstanceAction(editedInstance))
      setOpenDialog(OpenDialogName.EditDatabase)
    }
  }
  const handleDeleteInstances = (instances: Instance[]) => {
    if (
      instances.find((instance) => instance.id === editedInstance?.id) &&
      openDialog === OpenDialogName.EditDatabase
    ) {
      dispatch(setEditedInstance(null))
      setOpenDialog(null)
    }

    instances.forEach((instance) => {
      localStorageService.remove(BrowserStorageItem.dbConfig + instance.id)
    })
  }

  return (
    <HomePageTemplate>
      <div className={styles.pageWrapper}>
        <RiPage className={styles.page}>
          <RiPageBody component="div">
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
              {!isInstanceExists && !loading && !loadingChanging ? (
                <RiCard>
                  <EmptyMessage onAddInstanceClick={handleAddInstance} />
                </RiCard>
              ) : (
                <DatabasesList
                  loading={loading}
                  instances={instances}
                  predefinedInstances={predefinedInstances}
                  editedInstance={editedInstance}
                  onEditInstance={handleEditInstance}
                  onDeleteInstances={handleDeleteInstances}
                  onManageInstanceTags={handleManageInstanceTags}
                />
              )}
            </div>
          </RiPageBody>
        </RiPage>
      </div>
    </HomePageTemplate>
  )
}

export default HomePage
