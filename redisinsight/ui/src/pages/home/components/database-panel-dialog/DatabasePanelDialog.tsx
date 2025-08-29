import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { Nullable } from 'uiSrc/utils'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'
import { Instance } from 'uiSrc/slices/interfaces'
import { AddDbType } from 'uiSrc/pages/home/constants'
import {
  clusterSelector,
  resetDataRedisCluster,
} from 'uiSrc/slices/instances/cluster'
import {
  cloudSelector,
  resetDataRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import {
  resetDataSentinel,
  sentinelSelector,
} from 'uiSrc/slices/instances/sentinel'
import {
  appRedirectionSelector,
  setUrlHandlingInitialState,
} from 'uiSrc/slices/app/url-handling'

import ManualConnectionWrapper from 'uiSrc/pages/home/components/manual-connection'
import SentinelConnectionWrapper from 'uiSrc/pages/home/components/sentinel-connection'
import AddDatabaseScreen from 'uiSrc/pages/home/components/add-database-screen'

import CloudConnectionFormWrapper from 'uiSrc/pages/home/components/cloud-connection'
import ImportDatabase from 'uiSrc/pages/home/components/import-database'
import { FormDialog } from 'uiSrc/components'
import { ModalHeaderProvider } from 'uiSrc/contexts/ModalTitleProvider'
import { Title } from 'uiSrc/components/base/text/Title'
import ClusterConnectionFormWrapper from 'uiSrc/pages/home/components/cluster-connection'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { ArrowLeftIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'
import { FooterDatabaseForm } from 'uiSrc/components/form-dialog/FooterDatabaseForm'

export interface Props {
  editMode: boolean
  urlHandlingAction?: Nullable<UrlHandlingActions>
  editedInstance: Nullable<Instance>
  onClose: () => void
  onDbEdited?: () => void
  initConnectionType?: Nullable<AddDbType>
}

const DatabasePanelDialog = (props: Props) => {
  const { editMode, onClose } = props

  const [initialValues, setInitialValues] = useState(null)
  const [connectionType, setConnectionType] =
    useState<Nullable<AddDbType>>(null)
  const [modalHeader, setModalHeader] =
    useState<Nullable<React.ReactNode>>(null)

  const { credentials: clusterCredentials } = useSelector(clusterSelector)
  const { credentials: cloudCredentials } = useSelector(cloudSelector)
  const { data: sentinelMasters } = useSelector(sentinelSelector)
  const { action, dbConnection } = useSelector(appRedirectionSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    if (editMode) return
    if (clusterCredentials) {
      setConnectionType(AddDbType.software)
    }

    if (cloudCredentials) {
      setConnectionType(AddDbType.cloud)
    }

    if (sentinelMasters.length) {
      setConnectionType(AddDbType.sentinel)
    }
  }, [])

  useEffect(() => {
    if (action === UrlHandlingActions.Connect) {
      setConnectionType(AddDbType.manual)
      setInitialValues(dbConnection)
    }
  }, [action, dbConnection])

  useEffect(() => {
    if (editMode) {
      setConnectionType(AddDbType.manual)
    }
  }, [editMode])

  useEffect(
    () => () => {
      if (connectionType === AddDbType.manual) return

      switch (connectionType) {
        case AddDbType.cloud: {
          dispatch(resetDataRedisCluster())
          dispatch(resetDataSentinel())
          break
        }

        case AddDbType.sentinel: {
          dispatch(resetDataRedisCloud())
          dispatch(resetDataRedisCluster())
          break
        }

        case AddDbType.software: {
          dispatch(resetDataRedisCloud())
          dispatch(resetDataSentinel())
          break
        }
        default:
          break
      }
    },
    [connectionType],
  )

  const changeConnectionType = (connectionType: AddDbType, db: any) => {
    dispatch(setUrlHandlingInitialState())
    setInitialValues(db)
    setConnectionType(connectionType)
  }

  const handleClickBack = () => {
    setConnectionType(null)
  }

  const Form = () => (
    <>
      {connectionType === null && (
        <AddDatabaseScreen
          onSelectOption={changeConnectionType}
          onClose={onClose}
        />
      )}
      {connectionType === AddDbType.manual && (
        <ManualConnectionWrapper
          {...props}
          initialValues={initialValues}
          onClickBack={handleClickBack}
        />
      )}
      {connectionType === AddDbType.cloud && (
        <CloudConnectionFormWrapper {...props} />
      )}
      {connectionType === AddDbType.import && (
        <ImportDatabase onClose={onClose} />
      )}
      {connectionType === AddDbType.sentinel && (
        <SentinelConnectionWrapper {...props} />
      )}
      {connectionType === AddDbType.software && (
        <ClusterConnectionFormWrapper {...props} />
      )}
    </>
  )

  const handleSetModalHeader = (
    content: Nullable<React.ReactNode>,
    withBack = false,
  ) => {
    const header =
      withBack && content ? (
        <Row align="center" gap="s">
          <FlexItem>
            <IconButton
              onClick={handleClickBack}
              icon={ArrowLeftIcon}
              aria-label="back"
              data-testid="back-btn"
            />
          </FlexItem>
          <FlexItem grow>{content}</FlexItem>
        </Row>
      ) : (
        content
      )

    setModalHeader(header)
  }

  return (
    <FormDialog
      isOpen
      onClose={onClose}
      header={modalHeader ?? 'Add Database'}
      footer={<FooterDatabaseForm />}
    >
      <div
        className={cx(styles.bodyWrapper, 'container relative', {
          addDbWrapper: !editMode,
        })}
      >
        <div className={styles.formWrapper}>
          <ModalHeaderProvider
            value={{ modalHeader, setModalHeader: handleSetModalHeader }}
          >
            {Form()}
          </ModalHeaderProvider>
        </div>
      </div>
    </FormDialog>
  )
}

export default DatabasePanelDialog
