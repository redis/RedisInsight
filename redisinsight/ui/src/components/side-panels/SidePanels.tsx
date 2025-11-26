import React, { useEffect, useRef, useState } from 'react'
import cx from 'classnames'

import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { KeyboardKeys as keys } from 'uiSrc/constants/keys'

import {
  changeSelectedTab,
  changeSidePanel,
  insightsPanelSelector,
  resetExplorePanelSearch,
  setExplorePanelIsPageOpen,
  sidePanelsSelector,
} from 'uiSrc/slices/panels/sidePanels'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'
import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import {
  connectedInstanceCDSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { appContextCapability } from 'uiSrc/slices/app/context'
import { getTutorialCapability } from 'uiSrc/utils'
import { isShowCapabilityTutorialPopover } from 'uiSrc/services'
import { EAManifestFirstKey, FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { isAnyFeatureEnabled } from 'uiSrc/utils/features'

import { CopilotPanel, InsightsPanel } from './components'

import { StyledInnerSidePanel, StyledSidePanel } from './SidePanels.styles'

export interface Props {
  panelClassName?: string
}

const SidePanelsWrapper = (props: Props) => {
  const { panelClassName } = props
  const { openedPanel } = useSelector(sidePanelsSelector)
  const { tabSelected } = useSelector(insightsPanelSelector)
  const { provider } = useSelector(connectedInstanceSelector)
  const { source: capabilitySource } = useSelector(appContextCapability)
  const { free = false } = useSelector(connectedInstanceCDSelector) ?? {}
  const {
    [FeatureFlags.databaseChat]: databaseChatFeature,
    [FeatureFlags.documentationChat]: documentationChatFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)
  const isAnyChatAvailable = isAnyFeatureEnabled([
    databaseChatFeature,
    documentationChatFeature,
  ])

  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)

  const history = useHistory()
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const { instanceId } = useParams<{ instanceId: string }>()
  const pathnameRef = useRef<string>(pathname)

  const page = pathname.replace(instanceId, '').replace(/^\//g, '')

  useEffect(() => {
    if (openedPanel === SidePanels.AiAssistant && !isAnyChatAvailable) {
      dispatch(changeSidePanel(null))
    }
  }, [isAnyChatAvailable, tabSelected])

  useEffect(() => {
    window.addEventListener('keydown', handleEscFullScreen)
    return () => {
      window.removeEventListener('keydown', handleEscFullScreen)
    }
  }, [isFullScreen])

  useEffect(() => {
    if (isFullScreen && pathnameRef.current !== pathname) {
      setIsFullScreen(false)
    }

    pathnameRef.current = pathname
  }, [pathname, isFullScreen])

  useEffect(() => {
    if (!capabilitySource || !isShowCapabilityTutorialPopover(free)) {
      return
    }

    const tutorialCapabilityPath =
      getTutorialCapability(capabilitySource)?.path || ''

    // set 'path' with the path to capability tutorial
    if (tutorialCapabilityPath) {
      const search = new URLSearchParams(window.location.search)
      search.set(
        'path',
        `${EAManifestFirstKey.TUTORIALS}/${tutorialCapabilityPath}`,
      )
      history.push({ search: search.toString() })
    } else {
      // reset explore if tutorial is not found
      dispatch(resetExplorePanelSearch())
      dispatch(setExplorePanelIsPageOpen(false))
    }

    dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
    dispatch(changeSidePanel(SidePanels.Insights))
  }, [capabilitySource, free])

  const handleEscFullScreen = (event: KeyboardEvent) => {
    if (event?.key === keys.ESCAPE && isFullScreen) {
      handleFullScreen()
    }
  }

  const handleClose = () => {
    dispatch(changeSidePanel(null))

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_PANEL_CLOSED,
      eventData: {
        databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
        provider,
        page,
        tab: tabSelected,
      },
    })
  }

  const handleFullScreen = () => {
    setIsFullScreen((value) => {
      sendEventTelemetry({
        event: TelemetryEvent.INSIGHTS_PANEL_FULL_SCREEN_CLICKED,
        eventData: {
          databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
          state: value ? 'exit' : 'open',
        },
      })

      return !value
    })
  }

  return (
    <>
      {!!openedPanel && (
        <StyledSidePanel
          isFullScreen={isFullScreen}
          className={cx(panelClassName)}
          data-testid={`side-panels-${openedPanel}`}
        >
          <StyledInnerSidePanel>
            {openedPanel === SidePanels.AiAssistant && (
              <CopilotPanel
                isFullScreen={isFullScreen}
                onToggleFullScreen={handleFullScreen}
                onClose={handleClose}
              />
            )}
            {openedPanel === SidePanels.Insights && (
              <InsightsPanel
                isFullScreen={isFullScreen}
                onToggleFullScreen={handleFullScreen}
                onClose={handleClose}
              />
            )}
          </StyledInnerSidePanel>
        </StyledSidePanel>
      )}
    </>
  )
}

export default SidePanelsWrapper
