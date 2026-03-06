import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Title } from 'uiSrc/components/base/text'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import {
  RiIcon,
  PencilIcon,
  CancelSlimIcon,
  CheckThinIcon,
} from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components/base/tooltip'

import { useIndexNameValidation } from '../../../../hooks'
import { IndexNameEditorProps } from './IndexNameEditor.types'
import * as S from './IndexNameEditor.styles'

export const IndexNameEditor = ({
  indexName,
  onNameChange,
  validationError,
}: IndexNameEditorProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(indexName)
  const inputRef = useRef<HTMLInputElement>(null)
  const draftError = useIndexNameValidation(draft)
  const hasError = !!draftError

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing, hasError])

  const startEditing = useCallback(() => {
    setDraft(indexName)
    setIsEditing(true)
  }, [indexName])

  const cancelEditing = useCallback(() => {
    setIsEditing(false)
    setDraft(indexName)
  }, [indexName])

  const confirmEditing = useCallback(() => {
    if (draftError) {
      return
    }

    onNameChange(draft)
    setIsEditing(false)
  }, [draft, draftError, onNameChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        confirmEditing()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        cancelEditing()
      }
    },
    [confirmEditing, cancelEditing],
  )

  if (isEditing) {
    return (
      <S.EditRow align="center">
        <S.NameInput
          value={draft}
          onChange={(value: string) => setDraft(value)}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          error={draftError || undefined}
          data-testid="index-name-edit-input"
        />
        <IconButton
          icon={CancelSlimIcon}
          size="S"
          aria-label="Cancel editing"
          onClick={cancelEditing}
          data-testid="index-name-cancel-btn"
        />
        <IconButton
          icon={CheckThinIcon}
          size="S"
          color="primary"
          aria-label="Confirm index name"
          onClick={confirmEditing}
          disabled={hasError}
          data-testid="index-name-confirm-btn"
        />
      </S.EditRow>
    )
  }

  return (
    <S.DisplayRow onClick={startEditing} data-testid="index-name-display">
      {validationError && (
        <RiTooltip
          position="bottom"
          content={validationError}
          data-testid="index-name-error-tooltip"
        >
          <S.ErrorIcon>
            <RiIcon
              type="ToastDangerIcon"
              size="l"
              data-testid="index-name-error-icon"
            />
          </S.ErrorIcon>
        </RiTooltip>
      )}

      <Title size="M" color="primary">
        {indexName}
      </Title>
      <IconButton
        icon={PencilIcon}
        size="S"
        aria-label="Edit index name"
        data-testid="index-name-edit-btn"
      />
    </S.DisplayRow>
  )
}
