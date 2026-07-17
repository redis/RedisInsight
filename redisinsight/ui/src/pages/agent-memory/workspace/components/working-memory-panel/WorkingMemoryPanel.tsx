import React, { useState } from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { dispatch } from 'uiSrc/slices/store'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { connectedAgentMemoryEndpointSelector } from 'uiSrc/slices/agentMemory/endpoints'
import {
  agentMemoryFiltersSelector,
  agentMemoryWorkingSelector,
  clearWorkingMemoryAction,
  fetchWorkingMemoryAction,
} from 'uiSrc/slices/agentMemory/workspace'
import { AgentMemoryMessage } from 'uiSrc/slices/interfaces/agentMemory'

import { formatDateTime, pluralize, relativeTime } from '../../utils/format'
import PaneAutoRefresh from '../pane-auto-refresh/PaneAutoRefresh'
import TimestampWithRelative from '../timestamp-with-relative/TimestampWithRelative'
import AddEventDialog from '../add-event-dialog/AddEventDialog'
import * as S from './WorkingMemoryPanel.styles'

export interface WorkingMemoryPanelProps {
  endpointId: string
}

const CLEAR_SUFFIX = '_working_memory'

const MessageCard = ({ message }: { message: AgentMemoryMessage }) => (
  <S.Card data-testid="working-memory-message">
    <S.CardMeta>
      <S.RoleTag $role={message.role}>{message.role}</S.RoleTag>
      {message.createdAt && (
        <TimestampWithRelative
          dateTime={message.createdAt}
          content={
            <>
              <div>Created: {relativeTime(message.createdAt)}</div>
              {!!message.persistedAt && (
                <div>Persisted: {formatDateTime(message.persistedAt)}</div>
              )}
            </>
          }
        />
      )}
      {message.discreteMemoryExtracted !== null &&
        message.discreteMemoryExtracted !== undefined && (
          <S.ExtractedFlag $extracted={message.discreteMemoryExtracted}>
            {message.discreteMemoryExtracted
              ? 'extracted ✓'
              : 'extract pending'}
          </S.ExtractedFlag>
        )}
    </S.CardMeta>
    <S.CardText>{message.content}</S.CardText>
  </S.Card>
)

/** The selected session's message log plus its running summary. */
const WorkingMemoryPanel = ({ endpointId }: WorkingMemoryPanelProps) => {
  const { data, error, loading, lastRefreshTime } = useAppSelector(
    agentMemoryWorkingSelector,
  )
  const { sessionId } = useAppSelector(agentMemoryFiltersSelector)
  const { capabilities } = useAppSelector(connectedAgentMemoryEndpointSelector)
  const [clearing, setClearing] = useState('')
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)

  const messages = data?.messages ?? []

  return (
    <S.Pane data-testid="working-memory-panel">
      <S.PaneHeaderBlock>
        <S.PaneHeader align="center" justify="between">
          <S.PaneTitle align="center" gap="m">
            <h2>Working memory</h2>
            <S.PaneStats>
              {sessionId
                ? pluralize(messages.length, 'message')
                : 'no session selected'}
            </S.PaneStats>
          </S.PaneTitle>
          <S.PaneHeaderRight align="center">
            {capabilities?.addEvents && (
              <SecondaryButton
                size="small"
                data-testid="working-memory-add-event"
                onClick={() => setIsAddEventOpen(true)}
              >
                ＋ Add event
              </SecondaryButton>
            )}
            <PaneAutoRefresh
              postfix="agent-memory-wm"
              loading={loading}
              lastRefreshTime={lastRefreshTime}
              disabled={!sessionId}
              disabledRefreshButtonMessage="Select a session to refresh working memory."
              onRefresh={() => dispatch(fetchWorkingMemoryAction(endpointId))}
              testid="working-memory"
            />
          </S.PaneHeaderRight>
        </S.PaneHeader>
        <S.PaneMetaRow align="center" gap="l" data-testid="working-memory-meta">
          {!!sessionId && !!data ? (
            <>
              {data.createdAt && (
                <S.MetaItem>
                  <TimestampWithRelative
                    dateTime={data.createdAt}
                    content={`created ${relativeTime(data.createdAt)}`}
                    data-testid="working-memory-created-at"
                  />
                </S.MetaItem>
              )}
              <S.MetaItem data-testid="working-memory-ttl">
                TTL:
                <code>
                  {data.ttlSeconds != null
                    ? `${data.ttlSeconds} s`
                    : 'No limit'}
                </code>
              </S.MetaItem>
              <S.MetaRowActions>
                <PopoverDelete
                  header={sessionId}
                  text="All messages and the running summary will be deleted. This cannot be undone."
                  item={sessionId}
                  suffix={CLEAR_SUFFIX}
                  deleting={clearing}
                  updateLoading={false}
                  ariaLabel="Delete working memory for this scope"
                  closePopover={() => setClearing('')}
                  showPopover={(item) => setClearing(`${item}${CLEAR_SUFFIX}`)}
                  testid="working-memory-clear"
                  handleDeleteItem={() =>
                    dispatch(
                      clearWorkingMemoryAction(endpointId, () =>
                        setClearing(''),
                      ),
                    )
                  }
                />
              </S.MetaRowActions>
            </>
          ) : (
            /* placeholder line keeps the header height stable */
            <S.MetaItem>&nbsp;</S.MetaItem>
          )}
        </S.PaneMetaRow>
      </S.PaneHeaderBlock>
      {!!error && (
        <S.ErrorText data-testid="working-memory-error">{error}</S.ErrorText>
      )}
      <S.CardList>
        {messages.map((message, index) => (
          <li key={message.id ?? `${message.createdAt}-${index}`}>
            <MessageCard message={message} />
          </li>
        ))}
        {!messages.length && (
          <li>
            <S.EmptyListText data-testid="working-memory-empty">
              {sessionId
                ? 'No messages in working memory yet.'
                : 'Pick a session to inspect its working memory.'}
            </S.EmptyListText>
          </li>
        )}
      </S.CardList>
      {!!data?.summary && (
        <S.SummaryBlock data-testid="working-memory-summary">
          <h3>Running summary</h3>
          <p>{data.summary}</p>
        </S.SummaryBlock>
      )}
      <AddEventDialog
        endpointId={endpointId}
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
      />
    </S.Pane>
  )
}

export default WorkingMemoryPanel
