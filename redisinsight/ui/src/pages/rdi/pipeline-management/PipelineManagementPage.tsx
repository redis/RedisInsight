import React, { useEffect, useRef } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'
import {
  fetchRdiPipeline,
  fetchRdiPipelineJobFunctions,
  fetchRdiPipelineSchema,
} from 'uiSrc/slices/rdi/pipeline'
import {
  appContextPipelineManagement,
  setLastPageContext,
  setLastPipelineManagementPage,
} from 'uiSrc/slices/app/context'
import { formatLongName, setTitle } from 'uiSrc/utils'
import SourcePipelineDialog from 'uiSrc/pages/rdi/pipeline-management/components/source-pipeline-dialog'
import Navigation from 'uiSrc/pages/rdi/pipeline-management/components/navigation'

import { removeInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { InfiniteMessagesIds } from 'uiSrc/components/notifications/components'
import PipelinePageRouter from './PipelineManagementPageRouter'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { StyledRdiPageContainer } from 'uiSrc/pages/rdi/pipeline-management/styles'

export interface Props {
  routes: IRoute[]
}

const PipelineManagementPage = ({ routes = [] }: Props) => {
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { lastViewedPage } = useSelector(appContextPipelineManagement)
  const { name: connectedRdiInstanceName } = useSelector(
    connectedInstanceSelector,
  )

  const pathnameRef = useRef<string>('')

  const history = useHistory()
  const dispatch = useDispatch()
  const { pathname } = useLocation()

  const rdiInstanceName = formatLongName(connectedRdiInstanceName, 33, 0, '...')
  setTitle(`${rdiInstanceName} - Pipeline Management`)

  useEffect(() => {
    dispatch(fetchRdiPipeline(rdiInstanceId))
    dispatch(fetchRdiPipelineSchema(rdiInstanceId))
    dispatch(fetchRdiPipelineJobFunctions(rdiInstanceId))
  }, [])

  useEffect(
    () => () => {
      dispatch(setLastPageContext(PageNames.rdiPipelineManagement))
      dispatch(setLastPipelineManagementPage(pathnameRef.current))
      dispatch(
        removeInfiniteNotification(InfiniteMessagesIds.pipelineDeploySuccess),
      )
    },
    [],
  )

  useEffect(() => {
    if (pathname === Pages.rdiPipelineManagement(rdiInstanceId)) {
      if (pathnameRef.current && pathnameRef.current !== lastViewedPage) {
        history.push(pathnameRef.current)
        return
      }

      // restore from context
      if (lastViewedPage) {
        history.push(lastViewedPage)
        return
      }

      history.push(Pages.rdiPipelineConfig(rdiInstanceId))
    }

    pathnameRef.current =
      pathname === Pages.rdiPipelineManagement(rdiInstanceId) ? '' : pathname
  }, [pathname, lastViewedPage])

  return (
    <StyledRdiPageContainer gap="xl">
      <FlexItem>
        <Navigation />
      </FlexItem>
      <SourcePipelineDialog />
      <FlexItem grow>
        <PipelinePageRouter routes={routes} />
      </FlexItem>
    </StyledRdiPageContainer>
  )
}

export default PipelineManagementPage
