import React from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { dispatch } from 'uiSrc/slices/store'
import { RiTooltip } from 'uiSrc/components'
import {
  agentMemoryLongTermSelector,
  fetchLongTermMemoryAction,
  toggleSessionFilter,
  toggleTopicFilter,
} from 'uiSrc/slices/agentMemory/workspace'
import {
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
import * as S from './LongTermMemoryPanel.styles'

export interface LongTermMemoryPanelProps {
  endpointId: string
}

interface TopicChipsProps {
  values: string[]
  onPick: (value: string) => void
}

const TopicChips = ({ values, onPick }: TopicChipsProps) => {
  if (!values.length) return null
  return (
    <S.ChipRow>
      <S.ChipRowLabel>Topics</S.ChipRowLabel>
      <S.ChipRowChips wrap>
        {values.map((value) => (
          <RiTooltip
            key={value}
            position="bottom"
            content="Click to filter by this topic"
          >
            <S.Chip
              type="button"
              $kind="topic"
              data-testid={`topic-chip-${value}`}
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
}

const MemoryCard = ({ memory }: MemoryCardProps) => (
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
          copy={memory.id}
          label="Copy id"
          testId={`copy-id-${memory.id}`}
        />
        <RiTooltip title="Memory ID" position="bottom" content={memory.id}>
          <span>{shortId(memory.id)}</span>
        </RiTooltip>
      </S.CardId>
    </S.CardMeta>
    <S.CardText>{memory.text}</S.CardText>
    <TopicChips
      values={memory.topics}
      onPick={(topic) => dispatch(toggleTopicFilter(topic))}
    />
    {!!memory.sessionId && (
      <S.CardFooter>
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
      </S.CardFooter>
    )}
  </S.Card>
)

/** The long-term memory records list. Search + filters live in the
 * toolbar above the panel (LongTermMemoryToolbar). */
const LongTermMemoryPanel = ({ endpointId }: LongTermMemoryPanelProps) => {
  const { data, error, loading, lastRefreshTime } = useAppSelector(
    agentMemoryLongTermSelector,
  )

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
      {!!error && (
        <S.ErrorText data-testid="long-term-memory-error">{error}</S.ErrorText>
      )}
      <S.CardList>
        {data.map((memory) => (
          <li key={memory.id}>
            <MemoryCard memory={memory} />
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
