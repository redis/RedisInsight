import { pick, toNumber, omit } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'

import {
  checkConnectToInstanceAction,
  createInstanceStandaloneAction,
  instancesSelector,
  testInstanceStandaloneAction,
  updateInstanceAction,
  cloneInstanceAction,
} from 'uiSrc/slices/instances/instances'
import {
  Nullable,
  removeEmpty,
  getFormUpdates,
  transformQueryParamsObject,
  getDiffKeysOfObjectValues,
  isAzureDatabase,
} from 'uiSrc/utils'
import { BuildType } from 'uiSrc/constants/env'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { fetchCaCerts } from 'uiSrc/slices/instances/caCerts'
import { ConnectionType, Instance, InstanceType } from 'uiSrc/slices/interfaces'
import { DbType, Pages } from 'uiSrc/constants'
import { fetchClientCerts } from 'uiSrc/slices/instances/clientCerts'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'
import {
  appRedirectionSelector,
  setUrlHandlingInitialState,
} from 'uiSrc/slices/app/url-handling'
import { getRedirectionPage } from 'uiSrc/utils/routing'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import {
  applyTlSDatabase,
  applySSHDatabase,
  autoFillFormDetails,
  getTlsSettings,
  getFormValues,
} from 'uiSrc/pages/home/utils'
import {
  DEFAULT_TIMEOUT,
  SubmitBtnText,
  ADD_NEW,
  ADD_NEW_CA_CERT,
} from 'uiSrc/pages/home/constants'
import ManualConnectionForm from './manual-connection-form'

export interface Props {
  editMode: boolean
  urlHandlingAction?: Nullable<UrlHandlingActions>
  initialValues?: Nullable<Record<string, any>>
  editedInstance: Nullable<Instance>
  onClose?: () => void
  onClickBack?: () => void
  onDbEdited?: () => void
  onAliasEdited?: (value: string) => void
}

const ManualConnectionWrapper = (props: Props) => {
  const {
    editMode,
    onClose,
    onClickBack,
    onDbEdited,
    onAliasEdited,
    editedInstance,
    urlHandlingAction,
    initialValues: initialValuesProp,
  } = props
  const [formFields, setFormFields] = useState(
    getFormValues(editedInstance || initialValuesProp),
  )

  const [isCloneMode, setIsCloneMode] = useState<boolean>(false)

  const { loadingChanging: loadingStandalone } = useSelector(instancesSelector)
  const { server } = useSelector(appInfoSelector)
  const { properties: urlHandlingProperties } = useSelector(
    appRedirectionSelector,
  )

  const connectionType = editedInstance?.connectionType ?? DbType.STANDALONE

  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchCaCerts())
    dispatch(fetchClientCerts())
  }, [])

  useEffect(() => {
    setFormFields(getFormValues(editedInstance || initialValuesProp))
    setIsCloneMode(false)
  }, [editedInstance, initialValuesProp])

  const onMastersSentinelFetched = () => {
    history.push(Pages.sentinelDatabases)
  }

  const handleSuccessConnectWithRedirect = (id: string) => {
    const { redirect } = urlHandlingProperties
    dispatch(setUrlHandlingInitialState())

    dispatch(
      checkConnectToInstanceAction(id, (id) => {
        if (redirect) {
          const pageToRedirect = getRedirectionPage(redirect, id)

          if (pageToRedirect) {
            history.push(pageToRedirect)
          }
        }
      }),
    )
  }

  const handleAddDatabase = (payload: any) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_MANUALLY_SUBMITTED,
    })

    if (urlHandlingAction === UrlHandlingActions.Connect) {
      const cloudDetails = transformQueryParamsObject(
        pick(urlHandlingProperties, [
          'cloudId',
          'subscriptionType',
          'planMemoryLimit',
          'memoryLimitMeasurementUnit',
          'free',
        ]),
      )

      const db = { ...payload }
      if (cloudDetails?.cloudId) {
        db.cloudDetails = cloudDetails
      }

      dispatch(
        createInstanceStandaloneAction(
          db,
          undefined,
          handleSuccessConnectWithRedirect,
        ),
      )
      return
    }

    dispatch(createInstanceStandaloneAction(payload, onMastersSentinelFetched))
  }
  const handleEditDatabase = (payload: any) => {
    dispatch(updateInstanceAction(payload, onDbEdited))
  }

  const handleCloneDatabase = (payload: any) => {
    dispatch(cloneInstanceAction(payload))
  }

  const handleTestConnectionDatabase = (values: DbConnectionInfo) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_TEST_CONNECTION_CLICKED,
    })
    const payload = preparePayload(values)

    dispatch(testInstanceStandaloneAction(payload))
  }

  const handleConnectionFormSubmit = (values: DbConnectionInfo) => {
    if (isCloneMode) {
      const diffKeys = getDiffKeysOfObjectValues(formFields, values)
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_CONFIRMED,
        eventData: {
          fieldsModified: diffKeys,
        },
      })
    }
    const payload = preparePayload(values)

    if (isCloneMode) {
      handleCloneDatabase(payload)
      return
    }
    if (editMode) {
      handleEditDatabase(payload)
      return
    }

    handleAddDatabase(payload)
  }

  const preparePayload = (values: any) => {
    const tlsSettings = getTlsSettings(values)

    const {
      name,
      host,
      port,
      db,
      username,
      password,
      timeout,
      compressor,
      sentinelMasterName,
      sentinelMasterUsername,
      sentinelMasterPassword,
      ssh,
      tls,
      forceStandalone,
      keyNameFormat,
    } = values

    const database: any = {
      id: editedInstance?.id,
      name,
      host,
      port: +port,
      db: +(db || 0),
      username,
      password,
      compressor,
      timeout: timeout ? toNumber(timeout) * 1_000 : toNumber(DEFAULT_TIMEOUT),
      ssh,
      tls,
      forceStandalone,
      keyNameFormat,
    }

    // add tls & ssh for database (modifies database object)
    applyTlSDatabase(database, tlsSettings)
    applySSHDatabase(database, values)

    if (connectionType === ConnectionType.Sentinel) {
      database.sentinelMaster = {
        name: sentinelMasterName,
        username: sentinelMasterUsername,
        password: sentinelMasterPassword,
      }
    }

    if (editMode) {
      database.id = editedInstance?.id

      const updatedValues = getFormUpdates(
        database,
        omit(editedInstance, ['id']),
      )

      // When a new caCert/clientCert is deleted, the editedInstance
      // is not updated with the deletion until 'apply' is
      // clicked. Once the apply is clicked, the editedInstance object
      // that is validated against, still has the older certificates
      // attached. Attaching the new certs to the final object helps.
      if (
        values.selectedCaCertName === ADD_NEW_CA_CERT &&
        values.newCaCertName !== '' &&
        editedInstance &&
        values.newCaCertName === editedInstance.caCert?.name
      ) {
        updatedValues.caCert = database.caCert
      }

      if (
        values.selectedTlsClientCertId === ADD_NEW &&
        values.newTlsCertPairName !== '' &&
        values.newTlsCertPairName === editedInstance?.clientCert?.name
      ) {
        updatedValues.clientCert = database.clientCert
      }

      return updatedValues
    }

    return removeEmpty(database)
  }

  const handleOnClose = () => {
    dispatch(setUrlHandlingInitialState())

    if (isCloneMode) {
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_CANCELLED,
        eventData: {
          databaseId: editedInstance?.id,
        },
      })
    }
    onClose?.()
  }

  const getSubmitButtonText = () => {
    if (isCloneMode) {
      return SubmitBtnText.CloneDatabase
    }
    if (editMode) {
      return SubmitBtnText.EditDatabase
    }
    return SubmitBtnText.AddDatabase
  }

  const handlePostHostName = (content: string): boolean =>
    autoFillFormDetails(
      content,
      formFields,
      setFormFields,
      InstanceType.Standalone,
    )

  const isFromAzure = isAzureDatabase(editedInstance)

  return (
    <ManualConnectionForm
      formFields={formFields}
      connectionType={connectionType}
      loading={loadingStandalone}
      buildType={server?.buildType as BuildType}
      submitButtonText={getSubmitButtonText()}
      onSubmit={handleConnectionFormSubmit}
      onTestConnection={handleTestConnectionDatabase}
      onClose={handleOnClose}
      onHostNamePaste={handlePostHostName}
      isEditMode={editMode}
      isCloneMode={isCloneMode}
      setIsCloneMode={setIsCloneMode}
      onAliasEdited={onAliasEdited}
      onClickBack={onClickBack}
      isFromAzure={isFromAzure}
    />
  )
}

export default ManualConnectionWrapper
