import React, { useMemo } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import RunButton from 'uiSrc/components/query/components/RunButton'
import { useQueryEditorContext } from 'uiSrc/components/query'

import {
  TOOLTIP_EXPLAIN,
  TOOLTIP_PROFILE,
  TOOLTIP_DISABLED_NO_QUERY,
  TOOLTIP_DISABLED_LOADING,
} from './QueryEditor.constants'
import {
  parseExplainableCommand,
  buildExplainQuery,
  buildProfileQuery,
} from './QueryEditor.utils'
import * as S from './QueryEditor.styles'

/**
 * Actions bar for Vector Search editor.
 *
 * Contains:
 * - **Explain** – submits the query wrapped in FT.EXPLAIN
 * - **Profile** – submits the query wrapped in FT.PROFILE
 * - **Run** – submits the query as-is
 *
 * Explain and Profile are enabled only when the editor contains
 * a single FT.SEARCH or FT.AGGREGATE command.
 */
export const VectorSearchActions = () => {
  const { query, isLoading, onSubmit } = useQueryEditorContext()

  const parsed = useMemo(() => parseExplainableCommand(query), [query])
  const hasValidCommand = !!parsed
  const isExplainEnabled = hasValidCommand && !isLoading

  const disabledReason = useMemo(() => {
    if (!hasValidCommand) return TOOLTIP_DISABLED_NO_QUERY
    if (isLoading) return TOOLTIP_DISABLED_LOADING
    return undefined
  }, [hasValidCommand, isLoading])

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
        title={TOOLTIP_EXPLAIN}
        content={disabledReason}
        data-testid="explain-tooltip"
      >
        <EmptyButton
          onClick={handleExplain}
          disabled={!isExplainEnabled}
          aria-label="explain"
          data-testid="btn-explain"
        >
          Explain
        </EmptyButton>
      </RiTooltip>
      <RiTooltip
        position="top"
        title={TOOLTIP_PROFILE}
        content={disabledReason}
        data-testid="profile-tooltip"
      >
        <EmptyButton
          onClick={handleProfile}
          disabled={!isExplainEnabled}
          aria-label="profile"
          data-testid="btn-profile"
        >
          Profile
        </EmptyButton>
      </RiTooltip>
      <RunButton isLoading={isLoading} onSubmit={() => onSubmit()} />
    </S.ActionsBar>
  )
}
