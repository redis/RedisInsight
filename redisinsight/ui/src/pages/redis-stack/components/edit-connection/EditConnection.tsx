import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import {
  getApiErrorMessage,
  isStatusSuccessful,
  Nullable,
  setTitle,
} from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { PageHeader, PagePlaceholder } from 'uiSrc/components'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { setConnectedInstanceId } from 'uiSrc/slices/instances/instances'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { Instance } from 'uiSrc/slices/interfaces'
import { ContentCreateRedis } from 'uiSrc/slices/interfaces/content'
import PromoLink from 'uiSrc/components/promo-link/PromoLink'
import { getPathToResource } from 'uiSrc/services/resourcesService'
import { HELP_LINKS } from 'uiSrc/pages/home/constants'
import { sendEventTelemetry } from 'uiSrc/telemetry'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { contentSelector } from 'uiSrc/slices/content/create-redis-buttons'
import DatabasePanelDialog from 'uiSrc/pages/home/components/database-panel-dialog'
import { RiPage, RiPageBody, RiFlexItem } from 'uiSrc/components/base/layout'

import './styles.scss'
import styles from './styles.module.scss'

interface IState {
  loading: boolean
  error: string
  data: Nullable<Instance>
}
const DEFAULT_STATE = { loading: true, error: '', data: null }

const EditConnection = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { server } = useSelector(appInfoSelector)
  const { data: createDbContent } = useSelector(contentSelector)
  const [state, setState] = useState<IState>(DEFAULT_STATE)
  const { theme } = useContext(ThemeContext)

  let isApiSubscribed = false

  setTitle('Redis Stack')

  useEffect(() => {
    getInstanceInfo()
    return () => {
      isApiSubscribed = false
    }
  }, [])

  const onClose = () => history.goBack()

  const getInstanceInfo = async () => {
    try {
      setState(DEFAULT_STATE)
      isApiSubscribed = true
      const { data, status } = await apiService.get<Instance>(
        `${ApiEndpoints.DATABASES}/${server?.fixedDatabaseId}`,
      )
      if (isStatusSuccessful(status) && isApiSubscribed) {
        setState({ ...state, loading: false, data })
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      if (isApiSubscribed) {
        setState({ ...state, loading: false, error: errorMessage })
      }
      dispatch(addErrorNotification(error))
    }
  }
  const onInstanceChanged = () => {
    if (server?.fixedDatabaseId) {
      dispatch(setConnectedInstanceId(server.fixedDatabaseId))
      history.goBack()
    }
  }

  const CreateCloudBtn = ({ content }: { content: ContentCreateRedis }) => {
    const { title, description, styles, links } = content

    // @ts-ignore
    const linkStyles = styles ? styles[theme] : {}
    return (
      <PromoLink
        title={title}
        description={description}
        url={links?.main?.url}
        testId="promo-btn"
        styles={{
          ...linkStyles,
          backgroundImage: linkStyles?.backgroundImage
            ? `url(${getPathToResource(linkStyles.backgroundImage)})`
            : undefined,
        }}
        onClick={() =>
          sendEventTelemetry({
            event: HELP_LINKS.cloud.event,
            eventData: { source: 'Redis Stack' },
          })
        }
      />
    )
  }

  return state.loading ? (
    <PagePlaceholder />
  ) : (
    <>
      <PageHeader title="Redis Stack" />
      <div />
      <RiPage className="homePage redisStackConnection">
        <RiPageBody component="div" className={styles.container}>
          {createDbContent?.cloud && (
            <RiFlexItem style={{ margin: '20px 0' }}>
              <CreateCloudBtn content={createDbContent.cloud} />
            </RiFlexItem>
          )}
          <div className={styles.formContainer}>
            <div className={styles.form}>
              <DatabasePanelDialog
                editMode
                editedInstance={state.data}
                onDbEdited={onInstanceChanged}
                onClose={onClose}
              />
            </div>
          </div>
        </RiPageBody>
      </RiPage>
    </>
  )
}

export default EditConnection
