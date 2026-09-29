import React, { useEffect, useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { appContextSelector } from 'uiSrc/slices/app/context'
import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'

import { RdiInstancePageTemplate } from 'uiSrc/templates'
import { AppNavigation, RdiInstanceHeader } from 'uiSrc/components'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { useNavigation } from 'uiSrc/components/navigation-menu/hooks/useNavigation'
import { useRdiPipelineUi } from '../hooks/useRdiPipelineUi'
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
  const { lastPage, contextRdiInstanceId } = useAppSelector(appContextSelector)
  const rdiPipelineUi = useRdiPipelineUi(rdiInstanceId)

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

      if (rdiPipelineUi.status === 'loading') {
        return
      }

      history.replace(
        rdiPipelineUi.target === 'v2'
          ? Pages.rdiPipelineManagementV2(rdiInstanceId)
          : Pages.rdiPipelineManagement(rdiInstanceId),
      )
    }
  }, [pathname, location.state, contextRdiInstanceId, rdiPipelineUi])

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
