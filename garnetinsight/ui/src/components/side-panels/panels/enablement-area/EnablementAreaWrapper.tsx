import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { IInternalPage } from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { workbenchTutorialsSelector } from 'uiSrc/slices/workbench/wb-tutorials'
import { workbenchCustomTutorialsSelector } from 'uiSrc/slices/workbench/wb-custom-tutorials'
import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { CodeButtonParams } from 'uiSrc/constants'
import { sendWbQueryAction } from 'uiSrc/slices/workbench/wb-results'
import { getTutorialSection } from './EnablementArea/utils'
import EnablementArea from './EnablementArea'

export interface Props {}

const EnablementAreaWrapper = () => {
  const { loading: loadingTutorials, items: tutorials } = useSelector(
    workbenchTutorialsSelector,
  )
  const { loading: loadingCustomTutorials, items: customTutorials } =
    useSelector(workbenchCustomTutorialsSelector)

  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const openScript = (
    script: string,
    params?: CodeButtonParams,
    onFinish?: () => void,
  ) => {
    dispatch(
      sendWbQueryAction(script, null, params, { afterAll: onFinish }, onFinish),
    )
  }

  const onOpenInternalPage = ({ path, manifestPath }: IInternalPage) => {
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_TUTORIAL_OPENED,
      eventData: {
        path,
        section: getTutorialSection(manifestPath),
        databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
        source: 'Workbench',
      },
    })
  }

  return (
    <EnablementArea
      tutorials={tutorials}
      customTutorials={customTutorials}
      loading={loadingTutorials || loadingCustomTutorials}
      openScript={openScript}
      onOpenInternalPage={onOpenInternalPage}
      isCodeBtnDisabled={false}
    />
  )
}

export default React.memo(EnablementAreaWrapper)
