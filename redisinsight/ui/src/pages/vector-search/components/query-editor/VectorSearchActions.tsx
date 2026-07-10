import React, { useMemo } from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { RiTooltip } from 'uiSrc/components'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import RunButton from 'uiSrc/components/query/components/RunButton'
import { useQueryEditorContext } from 'uiSrc/components/query'

import {
  parseExplainableCommand,
  buildExplainQuery,
  buildProfileQuery,
} from './QueryEditor.utils'
import * as S from './QueryEditor.styles'
import { SaveIcon } from 'uiSrc/components/base/icons'

interface VectorSearchActionsProps {
  onSaveClick?: () => void
}

/**
 * Actions bar for Vector Search editor.
 *
 * Contains:
 * - **Save** – opens a modal to save the current query to the Query Library
 * - **Explain** – submits the query wrapped in FT.EXPLAIN
 * - **Profile** – submits the query wrapped in FT.PROFILE
 * - **Run** – submits the query as-is
 *
 * Explain and Profile are enabled only when the editor contains
 * a single FT.SEARCH or FT.AGGREGATE command.
 */
export const VectorSearchActions = ({
  onSaveClick,
}: VectorSearchActionsProps) => {
  const { t } = useTranslation()
  const { query, isLoading, onSubmit } = useQueryEditorContext()

  const parsed = useMemo(() => parseExplainableCommand(query), [query])
  const hasValidCommand = !!parsed
  const isExplainEnabled = hasValidCommand && !isLoading

  const hasQuery = !!query.trim()
  const isSaveEnabled = hasQuery && !isLoading

  const disabledReason = useMemo(() => {
    if (!hasValidCommand)
      return t('vectorSearch.query.editor.tooltip.disabledNoQuery')
    if (isLoading) return t('vectorSearch.query.editor.tooltip.disabledLoading')
    return undefined
  }, [hasValidCommand, isLoading, t])

  const handleExplain = () => {
    if (!parsed) return
    onSubmit(buildExplainQuery(parsed))
  }

  const handleProfile = () => {
    if (!parsed) return
    onSubmit(buildProfileQuery(parsed))
  }

  return (
    <S.ActionsBar data-testid="vector-search-actions">
      <RiTooltip
        position="top"
        title={t('vectorSearch.query.editor.tooltip.explain')}
        content={disabledReason}
        data-testid="explain-tooltip"
      >
        <EmptyButton
          onClick={handleExplain}
          disabled={!isExplainEnabled}
          aria-label={t('vectorSearch.query.editor.action.explainAria')}
          data-testid="btn-explain"
        >
          {t('vectorSearch.query.editor.action.explain')}
        </EmptyButton>
      </RiTooltip>
      <RiTooltip
        position="top"
        title={t('vectorSearch.query.editor.tooltip.profile')}
        content={disabledReason}
        data-testid="profile-tooltip"
      >
        <EmptyButton
          onClick={handleProfile}
          disabled={!isExplainEnabled}
          aria-label={t('vectorSearch.query.editor.action.profileAria')}
          data-testid="btn-profile"
        >
          {t('vectorSearch.query.editor.action.profile')}
        </EmptyButton>
      </RiTooltip>
      <EmptyButton
        icon={SaveIcon}
        onClick={onSaveClick}
        disabled={!isSaveEnabled}
        aria-label={t('vectorSearch.query.editor.action.saveAria')}
        data-testid="btn-save-query"
      >
        {t('vectorSearch.query.editor.action.save')}
      </EmptyButton>
      <RunButton isLoading={isLoading} onSubmit={() => onSubmit()} />
    </S.ActionsBar>
  )
}
