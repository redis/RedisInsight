import React, { useMemo } from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { dispatch } from 'uiSrc/slices/store'
import {
  agentMemoryLongTermSelector,
  fetchLongTermMemoryAction,
} from 'uiSrc/slices/agentMemory/workspace'
import { DEFAULT_MEMORY_TYPE } from 'uiSrc/slices/interfaces/agentMemory'

import { pluralize, relativeTime } from '../../utils/format'
import PaneAutoRefresh from '../pane-auto-refresh/PaneAutoRefresh'
import TimestampWithRelative from '../timestamp-with-relative/TimestampWithRelative'
import * as S from './LongTermOverviewPanel.styles'

/**
 * Overview flavor of long-term memory: the newest extractions with badge +
 * time + clamped text only. All controls (search, filters, per-memory
 * actions, summaries) live in the Long-term memory tab.
 */
export interface LongTermOverviewPanelProps {
  endpointId: string
}

const LongTermOverviewPanel = ({ endpointId }: LongTermOverviewPanelProps) => {
  const { data, error, loading, lastRefreshTime } = useAppSelector(
    agentMemoryLongTermSelector,
  )

  const latest = useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      ),
    [data],
  )

  const newestCreatedAt = latest[0]?.createdAt

  return (
    <S.Pane data-testid="long-term-overview-panel">
      <S.PaneHeaderBlock>
        <S.PaneHeader align="center" justify="between">
          <S.PaneTitle align="center" gap="m">
            <h2>Long-term memory</h2>
            <S.PaneStats>{pluralize(data.length, 'record')}</S.PaneStats>
          </S.PaneTitle>
          <S.PaneHeaderRight align="center">
            <PaneAutoRefresh
              postfix="agent-memory-overview"
              loading={loading}
              lastRefreshTime={lastRefreshTime}
              onRefresh={() =>
                dispatch(fetchLongTermMemoryAction(endpointId, true))
              }
              testid="long-term-overview"
            />
          </S.PaneHeaderRight>
        </S.PaneHeader>
        <S.PaneMetaRow
          align="center"
          gap="l"
          data-testid="long-term-overview-meta"
        >
          {/* non-breaking space keeps the header height stable when the
           * scoped list is empty */}
          <S.MetaItem>
            {newestCreatedAt ? (
              <TimestampWithRelative
                dateTime={newestCreatedAt}
                content={`latest extraction ${relativeTime(newestCreatedAt)}`}
                data-testid="long-term-overview-created-at"
              />
            ) : (
              <>&nbsp;</>
            )}
          </S.MetaItem>
        </S.PaneMetaRow>
      </S.PaneHeaderBlock>
      {!!error && (
        <S.ErrorText data-testid="long-term-overview-error">
          {error}
        </S.ErrorText>
      )}
      <S.CardList>
        {latest.map((memory) => (
          <li key={memory.id}>
            <S.CardCompact data-testid="long-term-overview-card">
              <S.CardMeta>
                <S.TypeBadge $type={memory.memoryType ?? DEFAULT_MEMORY_TYPE}>
                  {memory.memoryType ?? DEFAULT_MEMORY_TYPE}
                </S.TypeBadge>
                {memory.createdAt && (
                  <TimestampWithRelative dateTime={memory.createdAt} />
                )}
              </S.CardMeta>
              <S.CardText>{memory.text}</S.CardText>
            </S.CardCompact>
          </li>
        ))}
        {!latest.length && (
          <li>
            <S.EmptyListText data-testid="long-term-overview-empty">
              No long-term memories for the selected scope yet.
            </S.EmptyListText>
          </li>
        )}
      </S.CardList>
    </S.Pane>
  )
}

export default LongTermOverviewPanel
