import React, { useMemo } from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { dispatch } from 'uiSrc/slices/store'
import {
  agentMemoryFiltersSelector,
  agentMemoryLongTermSelector,
  clearLtmFilters,
  setLongTermMemorySearch,
  setSimilarityThreshold,
  toggleMemoryTypeFilter,
  toggleNamespaceFilter,
  toggleSessionFilter,
  toggleTopicFilter,
  toggleUserFilter,
} from 'uiSrc/slices/agentMemory/workspace'
import { DEFAULT_MEMORY_TYPE } from 'uiSrc/slices/interfaces/agentMemory'

import { shortId } from '../../utils/format'
import FilterDropdown from '../filter-dropdown/FilterDropdown'
import * as S from './LongTermMemoryToolbar.styles'

const MEMORY_TYPES = [DEFAULT_MEMORY_TYPE, 'episodic', 'message']
// Records carry an ownerId; label the picker "owner".
const USER_LABEL = 'owner'

/** Search + filter controls for the long-term memory records list. */
const LongTermMemoryToolbar = () => {
  const {
    data,
    search,
    similarityThreshold,
    topics,
    sessionIds,
    memoryTypes,
    userIds,
    namespaces,
  } = useAppSelector(agentMemoryLongTermSelector)
  const {
    sessions,
    users,
    namespaces: knownNamespaces,
  } = useAppSelector(agentMemoryFiltersSelector)

  // The server has no topic enumeration endpoint - offer the values
  // visible in the current result set plus anything already picked.
  const topicOptions = useMemo(
    () => [...new Set([...data.flatMap((m) => m.topics), ...topics])].sort(),
    [data, topics],
  )

  const handleThresholdChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = event.target.value
    if (raw === '') {
      dispatch(setSimilarityThreshold(null))
      return
    }
    const value = Math.min(1, Math.max(0, Number(raw)))
    dispatch(setSimilarityThreshold(Number.isNaN(value) ? null : value))
  }

  const filterPills: Array<{
    key: string
    label: string
    kind?: 'topic'
    onRemove: () => void
  }> = [
    ...userIds.map((filterUserId) => ({
      key: `user-${filterUserId}`,
      label: `${USER_LABEL}: ${filterUserId}`,
      onRemove: () => dispatch(toggleUserFilter(filterUserId)),
    })),
    ...namespaces.map((filterNamespace) => ({
      key: `ns-${filterNamespace}`,
      label: `namespace: ${filterNamespace}`,
      onRemove: () => dispatch(toggleNamespaceFilter(filterNamespace)),
    })),
    ...sessionIds.map((sessionId) => ({
      key: `session-${sessionId}`,
      label: `session: ${shortId(sessionId)}`,
      onRemove: () => dispatch(toggleSessionFilter(sessionId)),
    })),
    ...memoryTypes.map((memoryType) => ({
      key: `type-${memoryType}`,
      label: `type: ${memoryType}`,
      onRemove: () => dispatch(toggleMemoryTypeFilter(memoryType)),
    })),
    ...topics.map((topic) => ({
      key: `topic-${topic}`,
      label: `topic: ${topic}`,
      kind: 'topic' as const,
      onRemove: () => dispatch(toggleTopicFilter(topic)),
    })),
  ]

  return (
    <S.Toolbar data-testid="long-term-memory-toolbar">
      <S.SearchRow align="center" gap="m">
        <S.LtmSearch
          placeholder="Search"
          value={search}
          aria-label="Search long-term memory"
          name="agent-memory-search"
          data-testid="long-term-memory-search"
          onChange={(value: string) => dispatch(setLongTermMemorySearch(value))}
        />
        <S.ThresholdControl>
          <label htmlFor="similarity-threshold">Min similarity</label>
          <S.ThresholdInput
            id="similarity-threshold"
            type="number"
            min={0}
            max={1}
            step={0.05}
            placeholder="0–1"
            value={similarityThreshold ?? ''}
            data-testid="ltm-similarity-threshold"
            onChange={handleThresholdChange}
          />
        </S.ThresholdControl>
      </S.SearchRow>
      <S.FilterRow align="center" wrap>
        <FilterDropdown
          label={USER_LABEL}
          options={users}
          selected={userIds}
          emptyText="no owners discovered"
          data-testid="ltm-filter-users"
          onToggle={(value) => dispatch(toggleUserFilter(value))}
        />
        <FilterDropdown
          label="namespace"
          options={knownNamespaces}
          selected={namespaces}
          emptyText="no namespaces discovered"
          data-testid="ltm-filter-namespaces"
          onToggle={(value) => dispatch(toggleNamespaceFilter(value))}
        />
        <FilterDropdown
          label="sessions"
          options={sessions}
          selected={sessionIds}
          emptyText="no sessions"
          data-testid="ltm-filter-sessions"
          onToggle={(value) => dispatch(toggleSessionFilter(value))}
        />
        <FilterDropdown
          label="type"
          options={MEMORY_TYPES}
          selected={memoryTypes}
          data-testid="ltm-filter-type"
          onToggle={(value) => dispatch(toggleMemoryTypeFilter(value))}
        />
        <FilterDropdown
          label="topics"
          options={topicOptions}
          selected={topics}
          emptyText="no topics seen yet"
          data-testid="ltm-filter-topics"
          onToggle={(value) => dispatch(toggleTopicFilter(value))}
        />
      </S.FilterRow>
      {!!filterPills.length && (
        <S.ActiveFilters wrap data-testid="active-chip-filters">
          {filterPills.map(({ key, label, kind, onRemove }) => (
            <S.FilterPill key={key} $kind={kind}>
              {label}
              <S.FilterPillRemove
                type="button"
                aria-label={`Remove filter ${label}`}
                onClick={onRemove}
              >
                ✕
              </S.FilterPillRemove>
            </S.FilterPill>
          ))}
          <S.FilterClearAll
            type="button"
            data-testid="clear-chip-filters"
            onClick={() => dispatch(clearLtmFilters())}
          >
            clear all
          </S.FilterClearAll>
        </S.ActiveFilters>
      )}
    </S.Toolbar>
  )
}

export default LongTermMemoryToolbar
