import React, { useState } from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { dispatch } from 'uiSrc/slices/store'
import { CopyButton } from 'uiSrc/components/copy-button'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import {
  CancelSlimIcon,
  CheckThinIcon,
  EditIcon,
} from 'uiSrc/components/base/icons'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { EditableInput } from 'uiSrc/pages/browser/modules/key-details/shared'
import {
  agentMemorySelectedRecordSelector,
  deleteLongTermMemoryAction,
  setSelectedRecord,
  updateLongTermMemoryAction,
} from 'uiSrc/slices/agentMemory/workspace'
import {
  AgentMemoryRecordUpdate,
  DEFAULT_MEMORY_TYPE,
} from 'uiSrc/slices/interfaces/agentMemory'

import { formatDateTime, relativeTime } from '../../utils/format'
import TimestampWithRelative from '../timestamp-with-relative/TimestampWithRelative'
import * as S from './LongTermMemoryDetails.styles'

export interface LongTermMemoryDetailsProps {
  endpointId: string
}

const DELETE_SUFFIX = '_ltm_detail'

/**
 * Right-hand detail pane for the selected long-term memory record. Shows
 * every field; text/type/topics/namespace/owner/session are editable
 * inline (mirrors the Browser key-details editing), created/updated and id
 * are read-only.
 */
const LongTermMemoryDetails = ({ endpointId }: LongTermMemoryDetailsProps) => {
  const record = useAppSelector(agentMemorySelectedRecordSelector)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [textDraft, setTextDraft] = useState('')
  const [deleting, setDeleting] = useState('')

  if (!record) {
    return (
      <S.Pane data-testid="ltm-details-panel">
        <S.EmptyState data-testid="ltm-details-empty">
          Select a memory record to see its details.
        </S.EmptyState>
      </S.Pane>
    )
  }

  const applyUpdate = (patch: AgentMemoryRecordUpdate) =>
    dispatch(
      updateLongTermMemoryAction(endpointId, record.id, patch, () =>
        setEditingField(null),
      ),
    )

  const renderEditable = (
    field: string,
    label: string,
    value: string,
    toPatch: (next: string) => AgentMemoryRecordUpdate,
    placeholder: string,
  ) => (
    <>
      <S.FieldLabel>{label}</S.FieldLabel>
      <S.FieldValue>
        <EditableInput
          field={field}
          initialValue={value}
          placeholder={placeholder}
          isEditing={editingField === field}
          onEdit={(editing) => setEditingField(editing ? field : null)}
          onDecline={() => setEditingField(null)}
          onApply={(next) => applyUpdate(toPatch(next))}
          testIdPrefix={`ltm-${field}`}
        >
          {value ? (
            <span data-testid={`ltm-field-${field}`}>{value}</span>
          ) : (
            <S.Placeholder data-testid={`ltm-field-${field}`}>
              {placeholder}
            </S.Placeholder>
          )}
        </EditableInput>
      </S.FieldValue>
    </>
  )

  // The other fields use the shared EditableInput; the multi-line text needs a
  // textarea. EditableTextArea would give one, but it sizes itself through
  // react-virtualized AutoSizer, which only works inside fixed-size table cells
  // and collapses in this flow layout. So lay out a plain textarea with the
  // edit controls beside it, mirroring the read-only row.
  const renderText = () => (
    <>
      <S.FieldLabel>Text</S.FieldLabel>
      <S.FieldValue>
        {editingField === 'text' ? (
          <S.TextEditRow align="start" gap="s">
            <S.TextEditorArea
              rows={4}
              value={textDraft}
              onChange={(value: string) => setTextDraft(value)}
              data-testid="ltm-text-editor"
            />
            <IconButton
              icon={CancelSlimIcon}
              aria-label="Cancel editing text"
              data-testid="ltm-text-decline"
              onClick={() => setEditingField(null)}
            />
            <IconButton
              icon={CheckThinIcon}
              aria-label="Save text"
              data-testid="ltm-text-apply"
              onClick={() => applyUpdate({ text: textDraft })}
            />
          </S.TextEditRow>
        ) : (
          <S.TextReadonly align="start" gap="s">
            {record.text ? (
              <span data-testid="ltm-field-text">{record.text}</span>
            ) : (
              <S.Placeholder data-testid="ltm-field-text">
                No text
              </S.Placeholder>
            )}
            <IconButton
              className="ltm-inline-edit"
              icon={EditIcon}
              aria-label="Edit text"
              data-testid="ltm-text-edit"
              onClick={() => {
                setTextDraft(record.text)
                setEditingField('text')
              }}
            />
          </S.TextReadonly>
        )}
      </S.FieldValue>
    </>
  )

  return (
    <S.Pane data-testid="ltm-details-panel">
      <S.PaneHeaderBlock>
        <S.PaneHeader align="center" justify="between">
          <S.PaneTitle align="center" gap="m">
            <h2>Memory details</h2>
            <S.RecordId>
              <span data-testid="ltm-details-id">{record.id}</span>
              <CopyButton
                copy={record.id}
                aria-label="Copy memory id"
                data-testid="ltm-details-copy-id"
              />
            </S.RecordId>
          </S.PaneTitle>
          <S.HeaderRight>
            <PopoverDelete
              header="Memory"
              text="will be permanently deleted from long-term memory."
              item={record.id}
              suffix={DELETE_SUFFIX}
              deleting={deleting}
              updateLoading={false}
              closePopover={() => setDeleting('')}
              showPopover={(item) => setDeleting(`${item}${DELETE_SUFFIX}`)}
              testid="ltm-details-delete"
              handleDeleteItem={() =>
                dispatch(deleteLongTermMemoryAction(endpointId, record.id))
              }
            />
            <IconButton
              icon={CancelSlimIcon}
              aria-label="Close record details"
              data-testid="ltm-details-close"
              onClick={() => dispatch(setSelectedRecord(null))}
            />
          </S.HeaderRight>
        </S.PaneHeader>
      </S.PaneHeaderBlock>

      <S.Fields>
        {renderText()}
        {renderEditable(
          'memoryType',
          'Type',
          record.memoryType ?? DEFAULT_MEMORY_TYPE,
          (next) => ({ memoryType: next }),
          DEFAULT_MEMORY_TYPE,
        )}
        {renderEditable(
          'topics',
          'Topics',
          record.topics.join(', '),
          (next) => ({
            topics: next
              .split(',')
              .map((topic) => topic.trim())
              .filter(Boolean),
          }),
          'No topics',
        )}
        {renderEditable(
          'namespace',
          'Namespace',
          record.namespace ?? '',
          (next) => ({ namespace: next.trim() }),
          'No namespace',
        )}
        {renderEditable(
          'userId',
          'Owner (user)',
          record.userId ?? '',
          (next) => ({ userId: next.trim() }),
          'No owner',
        )}
        {renderEditable(
          'sessionId',
          'Session ID',
          record.sessionId ?? '',
          (next) => ({ sessionId: next.trim() }),
          'No session',
        )}

        <S.FieldLabel>Created</S.FieldLabel>
        <S.FieldValue>
          {record.createdAt ? (
            <S.ReadOnlyValue>
              <TimestampWithRelative
                dateTime={record.createdAt}
                content={`Created ${relativeTime(record.createdAt)}`}
              />
            </S.ReadOnlyValue>
          ) : (
            <S.Placeholder>—</S.Placeholder>
          )}
        </S.FieldValue>

        <S.FieldLabel>Updated</S.FieldLabel>
        <S.FieldValue>
          {record.updatedAt ? (
            <S.ReadOnlyValue data-testid="ltm-field-updatedAt">
              {formatDateTime(record.updatedAt)}
            </S.ReadOnlyValue>
          ) : (
            <S.Placeholder>—</S.Placeholder>
          )}
        </S.FieldValue>
      </S.Fields>
    </S.Pane>
  )
}

export default LongTermMemoryDetails
