import React, { useEffect, useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { appContextSelector } from 'uiSrc/slices/app/context'
import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import { isDevRdiUiEnabledSelector } from 'uiSrc/slices/app/features'
import { Nullable } from 'uiSrc/utils'
import { shouldUseRdiUiPipeline } from 'uiSrc/utils/rdi'

import { RdiInstancePageTemplate } from 'uiSrc/templates'
import { AppNavigation, RdiInstanceHeader } from 'uiSrc/components'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { useNavigation } from 'uiSrc/components/navigation-menu/hooks/useNavigation'
import { useConnectRdiInstance } from '../hooks/useConnectRdiInstance'
import InstancePageRouter from './InstancePageRouter'
import { RdiPipelineHeader } from './components'
import styles from './styles.module.scss'

export interface Props {
  routes: IRoute[]
}

const RdiInstancePage = ({ routes = [] }: Props) => {
  const history = useHistory()
  const location = useLocation<{ skipLastPageRestore?: boolean }>()
  const { pathname } = location
  const { privateRdiRoutes } = useNavigation()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { lastPage } = useAppSelector(appContextSelector)
  const { connectedInstance, contextRdiInstanceId } =
    useConnectRdiInstance(rdiInstanceId)
  const isDevRdiUiEnabled = useAppSelector(isDevRdiUiEnabledSelector)

  const [actions, setActions] = useState<Nullable<React.ReactNode>>(null)

  useEffect(() => {
    // redirect only if there is no exact path
    if (pathname === Pages.rdiPipeline(rdiInstanceId)) {
      if (
        !location.state?.skipLastPageRestore &&
        lastPage === PageNames.rdiStatistics &&
        contextRdiInstanceId === rdiInstanceId
      ) {
        // replace, not push - the bare URL isn't a real page, so it
        // shouldn't become a dead history entry that Back can land on
        history.replace(Pages.rdiStatistics(rdiInstanceId))
        return
      }

      // The connected instance (incl. version) loads asynchronously above.
      // `id` only matches `rdiInstanceId` once that fetch actually succeeds.
      // `contextRdiInstanceId === rdiInstanceId` confirms the store has
      // already processed *this* instance's reset+fetch cycle (it's set in
      // the same effect, synchronously) - without it, a stale `error` left
      // over from a previously viewed instance would look like "this
      // instance failed to load" on the very first render and push to
      // legacy before the real fetch ever gets a chance to resolve.
      const isSameInstanceContext = contextRdiInstanceId === rdiInstanceId
      const isConnectedInstanceReady =
        isSameInstanceContext && connectedInstance.id === rdiInstanceId
      const hasFailedToLoad =
        isSameInstanceContext &&
        !connectedInstance.loading &&
        !!connectedInstance.error &&
        !isConnectedInstanceReady

      if (!isConnectedInstanceReady && !hasFailedToLoad) {
        return
      }

      const shouldUseRdiUi =
        isConnectedInstanceReady &&
        shouldUseRdiUiPipeline(
          connectedInstance.version ?? '',
          isDevRdiUiEnabled,
        )

      history.replace(
        shouldUseRdiUi
          ? Pages.rdiPipelineManagementV2(rdiInstanceId)
          : Pages.rdiPipelineManagement(rdiInstanceId),
      )
    }
  }, [
    pathname,
    location.state,
    contextRdiInstanceId,
    connectedInstance.id,
    connectedInstance.error,
    connectedInstance.loading,
  ])

  return (
    <Col className={styles.page} gap="none" responsive={false}>
      <FlexItem>
        <RdiInstanceHeader />
      </FlexItem>
      <FlexItem>
        <AppNavigation
          actions={actions}
          onChange={() => setActions(null)}
          routes={privateRdiRoutes}
        />
      </FlexItem>
      <FlexItem grow={false}>
        <RdiPipelineHeader />
      </FlexItem>
      <RdiInstancePageTemplate>
        <InstancePageRouter routes={routes} />
      </RdiInstancePageTemplate>
    </Col>
  )
}

export default RdiInstancePage
