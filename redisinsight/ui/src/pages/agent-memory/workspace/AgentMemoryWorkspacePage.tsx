import React, { useEffect, useRef, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { dispatch } from 'uiSrc/slices/store'
import { Pages, BrowserStorageItem, FeatureFlags } from 'uiSrc/constants'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import FeatureFlagComponent from 'uiSrc/components/feature-flag-component'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { setTitle } from 'uiSrc/utils'
import {
  connectedAgentMemoryEndpointSelector,
  connectEndpointAction,
} from 'uiSrc/slices/agentMemory/endpoints'
import {
  agentMemoryFiltersSelector,
  agentMemoryLongTermSelector,
  agentMemorySummarySelector,
  discoverFiltersAction,
  fetchLongTermMemoryAction,
  fetchSummariesAction,
  fetchWorkingMemoryAction,
  resetWorkspace,
  setWorkspaceEndpoint,
} from 'uiSrc/slices/agentMemory/workspace'
import { Row } from 'uiSrc/components/base/layout/flex'
import {
  ResizablePanel,
  ResizablePanelHandle,
} from 'uiSrc/components/base/layout'
import { RiTooltip } from 'uiSrc/components'
import { Link } from 'uiSrc/components/base/link'
import { Text } from 'uiSrc/components/base/text'
import agentMemoryIcon from 'uiSrc/assets/img/agent-memory/agent-memory-icon.svg'
import { localStorageService } from 'uiSrc/services'
import { useDebouncedEffect } from 'uiSrc/services/hooks/hooks'

import Tabs from 'uiSrc/components/base/layout/tabs'
import { AgentMemoryWorkspaceTab } from 'uiSrc/slices/interfaces/agentMemory'

import FilterPills from './components/filter-pills/FilterPills'
import WorkingMemoryPanel from './components/working-memory-panel/WorkingMemoryPanel'
import LongTermOverviewPanel from './components/long-term-overview-panel/LongTermOverviewPanel'
import LongTermMemoryPanel from './components/long-term-memory-panel/LongTermMemoryPanel'
import SummaryViewsPanel from './components/summary-views-panel/SummaryViewsPanel'
import ConfigurationPanel from './components/configuration-panel/ConfigurationPanel'
import * as S from './AgentMemoryWorkspacePage.styles'

export const SEARCH_DEBOUNCE_MS = 300

const PANEL_MIN_SIZE = 20
const PANEL_DEFAULT_SIZES = [50, 50]

const WORKSPACE_TABS = [
  {
    value: AgentMemoryWorkspaceTab.Overview,
    label: 'Overview',
    content: null,
  },
  {
    value: AgentMemoryWorkspaceTab.LongTermMemory,
    label: 'Long-term memory',
    content: null,
  },
]

const getStoredPanelSizes = (key: BrowserStorageItem): number[] => {
  const stored = localStorageService.get(key)
  return Array.isArray(stored) && stored.length === 2
    ? stored
    : PANEL_DEFAULT_SIZES
}

const AgentMemoryWorkspacePage = () => {
  const history = useHistory()
  const { endpointId, tab } = useParams<{ endpointId: string; tab?: string }>()
  const connectedEndpoint = useAppSelector(connectedAgentMemoryEndpointSelector)
  const filters = useAppSelector(agentMemoryFiltersSelector)
  const longTermMemory = useAppSelector(agentMemoryLongTermSelector)
  const summary = useAppSelector(agentMemorySummarySelector)

  const isConnected = connectedEndpoint.id === endpointId

  let endpointHost = connectedEndpoint.url
  try {
    endpointHost = new URL(connectedEndpoint.url).host
  } catch {
    // keep the raw url when it isn't parseable
  }

  const [overviewSizes] = useState<number[]>(() =>
    getStoredPanelSizes(BrowserStorageItem.agentMemoryPanelSizes),
  )
  const [ltmSizes] = useState<number[]>(() =>
    getStoredPanelSizes(BrowserStorageItem.agentMemoryLtmPanelSizes),
  )
  const isKnownTab = (
    Object.values(AgentMemoryWorkspaceTab) as string[]
  ).includes(tab ?? '')
  const activeTab = isKnownTab
    ? (tab as AgentMemoryWorkspaceTab)
    : AgentMemoryWorkspaceTab.Overview
  const setActiveTab = (nextTab: AgentMemoryWorkspaceTab) => {
    history.push(Pages.agentMemoryWorkspace(endpointId, nextTab))
  }
  const isOverviewTab = activeTab === AgentMemoryWorkspaceTab.Overview
  const isLtmTab = activeTab === AgentMemoryWorkspaceTab.LongTermMemory

  // Normalize bare/unknown tab segments to the canonical overview URL.
  useEffect(() => {
    if (!isKnownTab) {
      history.replace(
        Pages.agentMemoryWorkspace(
          endpointId,
          AgentMemoryWorkspaceTab.Overview,
        ),
      )
    }
  }, [endpointId, isKnownTab])

  // Older OSS servers report the capability but the view list resolves
  // null - without it the pane would render blank.
  const showSummaryPane =
    !!connectedEndpoint.capabilities?.summaryViews && summary.views !== null

  const persistPanelSizes = (key: BrowserStorageItem) => (sizes: number[]) => {
    localStorageService.set(key, sizes)
  }

  const refreshAll = () => {
    dispatch(fetchWorkingMemoryAction(endpointId))
    dispatch(fetchLongTermMemoryAction(endpointId, true))
    dispatch(fetchSummariesAction(endpointId))
  }

  const bootstrap = async () => {
    await dispatch(discoverFiltersAction(endpointId))
    refreshAll()
  }

  useEffect(() => {
    setTitle('Agent Memory Workspace')

    dispatch(resetWorkspace())
    // Bind the inspector to this endpoint - thunks drop responses that
    // resolve after the binding changes (late replies from a previous
    // endpoint cannot overwrite this one's state).
    dispatch(setWorkspaceEndpoint(endpointId))
    if (!isConnected) {
      dispatch(
        connectEndpointAction(endpointId, bootstrap, () =>
          history.push(Pages.agentMemory),
        ),
      )
    } else {
      bootstrap()
    }

    return () => {
      dispatch(resetWorkspace())
    }
  }, [endpointId])

  // The effects below skip their first run: the initial data load is
  // bootstrap's job, these only react to later changes.
  const didMountRef = useRef(false)

  // Refresh on tab switch so filter changes made elsewhere show at once.
  useEffect(() => {
    if (!didMountRef.current || !isConnected) return
    if (isOverviewTab) {
      dispatch(fetchWorkingMemoryAction(endpointId))
      dispatch(fetchLongTermMemoryAction(endpointId, true))
    }
    if (isLtmTab) {
      dispatch(fetchLongTermMemoryAction(endpointId))
      dispatch(fetchSummariesAction(endpointId))
    }
  }, [activeTab])

  // Session pick scopes both Overview panes; user/namespace changes are
  // orchestrated by changeScopeAction (sessions must re-list before any
  // refetch pairs the new scope with a stale session).
  useEffect(() => {
    if (!didMountRef.current || !isConnected) return
    dispatch(fetchWorkingMemoryAction(endpointId))
    dispatch(fetchLongTermMemoryAction(endpointId, true))
  }, [filters.sessionId])

  // Records refetch when the explorer filters change. The search text is
  // handled separately with a debounce.
  useEffect(() => {
    if (!didMountRef.current || !isConnected) return
    dispatch(fetchLongTermMemoryAction(endpointId))
  }, [
    longTermMemory.optimizeQuery,
    longTermMemory.topics,
    longTermMemory.entities,
    longTermMemory.sessionIds,
    longTermMemory.memoryTypes,
    longTermMemory.userIds,
    longTermMemory.namespaces,
  ])

  // Debounced search - the input dispatches per keystroke, but only the
  // settled value triggers the (semantic, hence relatively expensive)
  // long-term memory search request.
  // didMountRef is already true when the debounced callback fires, so it
  // can't skip the mount run - track that separately.
  const searchDidMountRef = useRef(false)
  useDebouncedEffect(
    () => {
      if (!searchDidMountRef.current) {
        searchDidMountRef.current = true
        return
      }
      if (!isConnected) return
      dispatch(fetchLongTermMemoryAction(endpointId))
    },
    SEARCH_DEBOUNCE_MS,
    [longTermMemory.search],
  )

  // Keep last so the change-effects above skip their initial-mount run.
  useEffect(() => {
    didMountRef.current = true
  }, [])

  if (!isConnected) {
    return (
      <S.Page align="center" justify="center">
        <Text data-testid="agent-memory-connecting">
          {connectedEndpoint.loading
            ? 'Connecting to the agent memory endpoint...'
            : connectedEndpoint.error || 'Not connected'}
        </Text>
      </S.Page>
    )
  }

  return (
    <S.Page data-testid="agent-memory-workspace-page">
      <S.HeaderBar align="center" justify="between" gap="l" grow={false}>
        <Row align="center" gap="s" grow={false}>
          <S.HeaderIcon src={agentMemoryIcon} alt="" />
          <Link
            color="subdued"
            underline
            variant="inline"
            aria-label="Redis Agent Memory"
            data-testid="agent-memory-back-link"
            onClick={() => history.push(Pages.agentMemory)}
          >
            Redis Agent Memory
          </Link>
          <Text color="secondary">/</Text>
          <RiTooltip
            title={connectedEndpoint.name}
            position="bottom"
            content={connectedEndpoint.url}
          >
            <Text>{endpointHost}</Text>
          </RiTooltip>
          <S.HeaderPreviewBadge
            label="Preview"
            variant="notice"
            data-testid="agent-memory-preview-badge"
          />
        </Row>
        <Row align="center" gap="l" grow={false}>
          <Link
            color="subdued"
            variant="inline"
            data-testid="agent-memory-configuration-link"
            onClick={() => setActiveTab(AgentMemoryWorkspaceTab.Configuration)}
          >
            Configuration
          </Link>
        </Row>
      </S.HeaderBar>
      <S.InspectorTabs justify="center">
        <Tabs
          tabs={WORKSPACE_TABS}
          value={activeTab}
          onChange={(value) => setActiveTab(value as AgentMemoryWorkspaceTab)}
          data-testid="agent-memory-workspace-tabs"
        />
      </S.InspectorTabs>
      {isOverviewTab && (
        <S.ContextBar align="center" justify="end">
          <FilterPills endpointId={endpointId} />
        </S.ContextBar>
      )}
      {isOverviewTab && (
        <S.PanesArea>
          <S.PanesContainer
            direction="horizontal"
            onLayout={persistPanelSizes(
              BrowserStorageItem.agentMemoryPanelSizes,
            )}
          >
            <ResizablePanel
              id="agent-memory-working-panel"
              defaultSize={overviewSizes[0]}
              minSize={PANEL_MIN_SIZE}
            >
              <WorkingMemoryPanel endpointId={endpointId} />
            </ResizablePanel>
            <ResizablePanelHandle />
            <ResizablePanel
              id="agent-memory-overview-ltm-panel"
              defaultSize={overviewSizes[1]}
              minSize={PANEL_MIN_SIZE}
            >
              <LongTermOverviewPanel endpointId={endpointId} />
            </ResizablePanel>
          </S.PanesContainer>
        </S.PanesArea>
      )}
      {isLtmTab && (
        <S.PanesArea>
          {showSummaryPane ? (
            <S.PanesContainer
              direction="horizontal"
              onLayout={persistPanelSizes(
                BrowserStorageItem.agentMemoryLtmPanelSizes,
              )}
            >
              <ResizablePanel
                id="agent-memory-records-panel"
                defaultSize={ltmSizes[0]}
                minSize={PANEL_MIN_SIZE}
              >
                <LongTermMemoryPanel endpointId={endpointId} />
              </ResizablePanel>
              <ResizablePanelHandle />
              <ResizablePanel
                id="agent-memory-summaries-panel"
                defaultSize={ltmSizes[1]}
                minSize={PANEL_MIN_SIZE}
              >
                <SummaryViewsPanel endpointId={endpointId} />
              </ResizablePanel>
            </S.PanesContainer>
          ) : (
            <S.PanesContainer direction="horizontal">
              <ResizablePanel id="agent-memory-records-panel" defaultSize={100}>
                <LongTermMemoryPanel endpointId={endpointId} />
              </ResizablePanel>
            </S.PanesContainer>
          )}
        </S.PanesArea>
      )}
      {activeTab === AgentMemoryWorkspaceTab.Configuration && (
        <ConfigurationPanel endpointId={endpointId} />
      )}
      <S.FooterBar>
        <FeatureFlagComponent name={FeatureFlags.envDependent}>
          <S.SurveyLink
            target="_blank"
            rel="noreferrer"
            href={EXTERNAL_LINKS.userSurvey}
            onClick={() =>
              sendEventTelemetry({
                event: TelemetryEvent.USER_SURVEY_LINK_CLICKED,
              })
            }
            data-testid="agent-memory-user-survey-link"
          >
            <RiIcon type="SurveyIcon" />
            <span>Let us know what you think</span>
          </S.SurveyLink>
        </FeatureFlagComponent>
      </S.FooterBar>
    </S.Page>
  )
}

export default AgentMemoryWorkspacePage
