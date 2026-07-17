import React, { useMemo, useState } from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { dispatch } from 'uiSrc/slices/store'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { RiTooltip } from 'uiSrc/components'
import { connectedAgentMemoryEndpointSelector } from 'uiSrc/slices/agentMemory/endpoints'
import {
  agentMemoryFiltersSelector,
  agentMemoryLongTermSelector,
  clearLtmFilters,
  deleteLongTermMemoryAction,
  fetchLongTermMemoryAction,
  setLongTermMemorySearch,
  setOptimizeQuery,
  toggleEntityFilter,
  toggleMemoryTypeFilter,
  toggleNamespaceFilter,
  toggleSessionFilter,
  toggleTopicFilter,
  toggleUserFilter,
} from 'uiSrc/slices/agentMemory/workspace'
import {
  AgentMemoryBackendType,
  DEFAULT_MEMORY_TYPE,
  LongTermMemoryRecord,
} from 'uiSrc/slices/interfaces/agentMemory'

import {
  formatDateTime,
  pluralize,
  relativeTime,
  shortId,
} from '../../utils/format'
import PaneAutoRefresh from '../pane-auto-refresh/PaneAutoRefresh'
import TimestampWithRelative from '../timestamp-with-relative/TimestampWithRelative'
import HoverCopyButton from '../hover-copy-button/HoverCopyButton'
import FilterDropdown from '../filter-dropdown/FilterDropdown'
import * as S from './LongTermMemoryPanel.styles'

export interface LongTermMemoryPanelProps {
  endpointId: string
}

const DELETE_SUFFIX = '_long_term_memory'
const MEMORY_TYPES = [DEFAULT_MEMORY_TYPE, 'episodic', 'message']

interface ChipSectionProps {
  label: string
  kind: 'topic' | 'entity'
  values: string[]
  onPick: (value: string) => void
}

const ChipSection = ({ label, kind, values, onPick }: ChipSectionProps) => {
  if (!values.length) return null
  return (
    <S.ChipRow>
      <S.ChipRowLabel>{label}</S.ChipRowLabel>
      <S.ChipRowChips wrap>
        {values.map((value) => (
          <RiTooltip
            key={value}
            position="bottom"
            content={`Click to filter by this ${kind}`}
          >
            <S.Chip
              type="button"
              $kind={kind}
              data-testid={`${kind}-chip-${value}`}
              onClick={() => onPick(value)}
            >
              {value}
            </S.Chip>
          </RiTooltip>
        ))}
      </S.ChipRowChips>
    </S.ChipRow>
  )
}

interface MemoryCardProps {
  memory: LongTermMemoryRecord
  deletingId: string
  onDelete: (memory: LongTermMemoryRecord) => void
  setDeletingId: (id: string) => void
}

const MemoryCard = ({
  memory,
  deletingId,
  onDelete,
  setDeletingId,
}: MemoryCardProps) => (
  <S.Card data-testid="long-term-memory-card">
    <S.CardMeta>
      <S.TypeBadge $type={memory.memoryType ?? DEFAULT_MEMORY_TYPE}>
        {memory.memoryType ?? DEFAULT_MEMORY_TYPE}
      </S.TypeBadge>
      {memory.createdAt && (
        <TimestampWithRelative
          dateTime={memory.createdAt}
          content={
            <>
              <div>Created: {relativeTime(memory.createdAt)}</div>
              <div>
                Updated: {formatDateTime(memory.updatedAt ?? memory.createdAt)}
              </div>
            </>
          }
        />
      )}
      <S.CardId>
        <HoverCopyButton
          copy={memory.key ?? memory.id}
          label="Copy key name"
          testId={`copy-key-${memory.id}`}
        />
        <RiTooltip
          title="Key Name"
          position="bottom"
          content={memory.key ?? memory.id}
        >
          <span>{shortId(memory.id)}</span>
        </RiTooltip>
      </S.CardId>
      {typeof memory.score === 'number' && (
        <RiTooltip
          title="Similarity score"
          position="bottom"
          content="Higher = better match"
        >
          <S.ScoreBadge>{memory.score.toFixed(3)}</S.ScoreBadge>
        </RiTooltip>
      )}
    </S.CardMeta>
    <S.CardText>{memory.text}</S.CardText>
    <ChipSection
      label="Topics"
      kind="topic"
      values={memory.topics}
      onPick={(topic) => dispatch(toggleTopicFilter(topic))}
    />
    <ChipSection
      label="Entities"
      kind="entity"
      values={memory.entities}
      onPick={(entity) => dispatch(toggleEntityFilter(entity))}
    />
    <S.CardFooter>
      {!!memory.sessionId && (
        <S.CardMetaSession>
          <S.VisuallyHidden>from session:</S.VisuallyHidden>
          <RiTooltip
            title="Session ID"
            position="bottom"
            content="Click to filter by this session"
          >
            <S.CardSessionButton
              type="button"
              data-testid={`session-filter-${memory.sessionId}`}
              onClick={() => dispatch(toggleSessionFilter(memory.sessionId!))}
            >
              {memory.sessionId}
            </S.CardSessionButton>
          </RiTooltip>
          <HoverCopyButton
            copy={memory.sessionId}
            label="Copy session id"
            testId={`copy-session-${memory.sessionId}`}
          />
        </S.CardMetaSession>
      )}
      <S.CardDeleteWrapper>
        <PopoverDelete
          header="Memory"
          text="will be permanently deleted from long-term memory."
          item={memory.id}
          suffix={DELETE_SUFFIX}
          deleting={deletingId}
          updateLoading={false}
          closePopover={() => setDeletingId('')}
          showPopover={(item) => setDeletingId(`${item}${DELETE_SUFFIX}`)}
          testid={`delete-memory-${memory.id}`}
          handleDeleteItem={() => onDelete(memory)}
        />
      </S.CardDeleteWrapper>
    </S.CardFooter>
  </S.Card>
)

/** Searchable records list with every server-side filter as a control. */
const LongTermMemoryPanel = ({ endpointId }: LongTermMemoryPanelProps) => {
  const {
    data,
    error,
    loading,
    lastRefreshTime,
    search,
    optimizeQuery,
    topics,
    entities,
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
  const { capabilities, backendType } = useAppSelector(
    connectedAgentMemoryEndpointSelector,
  )
  const [deletingId, setDeletingId] = useState('')

  // Cloud's records carry ownerId - "user" is OSS terminology.
  const userLabel =
    backendType === AgentMemoryBackendType.Cloud ? 'owner' : 'user'

  // The server has no topic/entity enumeration endpoint - offer the
  // values visible in the current result set plus anything already picked.
  const topicOptions = useMemo(
    () => [...new Set([...data.flatMap((m) => m.topics), ...topics])].sort(),
    [data, topics],
  )
  const entityOptions = useMemo(
    () =>
      [...new Set([...data.flatMap((m) => m.entities), ...entities])].sort(),
    [data, entities],
  )

  const handleDelete = (memory: LongTermMemoryRecord) => {
    dispatch(
      deleteLongTermMemoryAction(endpointId, memory.id, () =>
        setDeletingId(''),
      ),
    )
  }

  const filterPills: Array<{
    key: string
    label: string
    kind?: 'topic' | 'entity'
    onRemove: () => void
  }> = [
    ...userIds.map((filterUserId) => ({
      key: `user-${filterUserId}`,
      label: `${userLabel}: ${filterUserId}`,
      onRemove: () => dispatch(toggleUserFilter(filterUserId)),
    })),
    ...namespaces.map((filterNamespace) => ({
      key: `ns-${filterNamespace}`,
      label: `ns: ${filterNamespace}`,
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
    ...entities.map((entity) => ({
      key: `entity-${entity}`,
      label: `entity: ${entity}`,
      kind: 'entity' as const,
      onRemove: () => dispatch(toggleEntityFilter(entity)),
    })),
  ]

  return (
    <S.Pane data-testid="long-term-memory-panel">
      <S.PaneHeaderBlock>
        <S.PaneHeader align="center" justify="between">
          <S.PaneTitle align="center" gap="m">
            <h2>Memory records</h2>
            <S.PaneStats>{pluralize(data.length, 'result')}</S.PaneStats>
          </S.PaneTitle>
          <S.PaneHeaderRight align="center">
            <PaneAutoRefresh
              postfix="agent-memory-records"
              loading={loading}
              lastRefreshTime={lastRefreshTime}
              onRefresh={() => dispatch(fetchLongTermMemoryAction(endpointId))}
              testid="ltm-records"
            />
          </S.PaneHeaderRight>
        </S.PaneHeader>
      </S.PaneHeaderBlock>
      <S.PaneToolbar>
        <S.SearchRow align="center" gap="m">
          <S.LtmSearch
            placeholder="Search memories (semantic + keyword)…"
            value={search}
            aria-label="Search long-term memory"
            name="agent-memory-search"
            data-testid="long-term-memory-search"
            onChange={(value: string) =>
              dispatch(setLongTermMemorySearch(value))
            }
          />
          {capabilities?.optimizeQuery && (
            <Checkbox
              id="optimize-query"
              name="optimizeQuery"
              label="Optimize query"
              checked={optimizeQuery}
              onChange={(e) => dispatch(setOptimizeQuery(e.target.checked))}
              data-testid="long-term-memory-optimize-query"
            />
          )}
        </S.SearchRow>
        <S.FilterRow align="center" wrap>
          <FilterDropdown
            label={userLabel}
            options={users}
            selected={userIds}
            emptyText="no users discovered"
            data-testid="ltm-filter-users"
            onToggle={(value) => dispatch(toggleUserFilter(value))}
          />
          {capabilities?.namespaces && (
            <FilterDropdown
              label="ns"
              options={knownNamespaces}
              selected={namespaces}
              emptyText="no namespaces discovered"
              data-testid="ltm-filter-namespaces"
              onToggle={(value) => dispatch(toggleNamespaceFilter(value))}
            />
          )}
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
          <FilterDropdown
            label="entities"
            options={entityOptions}
            selected={entities}
            emptyText="no entities seen yet"
            data-testid="ltm-filter-entities"
            onToggle={(value) => dispatch(toggleEntityFilter(value))}
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
      </S.PaneToolbar>
      {!!error && (
        <S.ErrorText data-testid="long-term-memory-error">{error}</S.ErrorText>
      )}
      <S.CardList>
        {data.map((memory) => (
          <li key={memory.id}>
            <MemoryCard
              memory={memory}
              deletingId={deletingId}
              onDelete={handleDelete}
              setDeletingId={setDeletingId}
            />
          </li>
        ))}
        {!data.length && (
          <li>
            <S.EmptyListText data-testid="long-term-memory-empty">
              No long-term memories found for the current filters.
            </S.EmptyListText>
          </li>
        )}
      </S.CardList>
    </S.Pane>
  )
}

export default LongTermMemoryPanel
