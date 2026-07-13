import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { KEYBOARD_SHORTCUTS } from 'uiSrc/constants'
import { KeyboardShortcut, RiTooltip } from 'uiSrc/components'
import { isMacOs } from 'uiSrc/utils/dom'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import RunButton from 'uiSrc/components/query/components/RunButton'

export interface Props {
  onSubmit: () => void
  onClear: () => void
  isLoading?: boolean
}

const QueryLiteActions = (props: Props) => {
  const { t } = useTranslation()
  const { isLoading, onSubmit, onClear } = props
  const KeyBoardTooltipContent = KEYBOARD_SHORTCUTS?.workbench?.runQuery && (
    <>
      <Text size="s">
        {t(
          isMacOs()
            ? 'query.runShortcut.label'
            : 'query.runShortcut.labelNonMac',
        )}
        :
      </Text>
      <Spacer size="s" />
      <KeyboardShortcut
        separator={KEYBOARD_SHORTCUTS?._separator}
        items={KEYBOARD_SHORTCUTS.workbench.runQuery.keys}
      />
    </>
  )

  return (
    <>
      <RiTooltip
        position="right"
        content={
          isLoading
            ? t('query.executing')
            : t('query.liteActions.clear.tooltip')
        }
        data-testid="clear-query-tooltip"
      >
        <EmptyButton
          onClick={onClear}
          loading={isLoading}
          disabled={isLoading}
          aria-label={t('query.liteActions.clear.aria')}
          data-testid="btn-clear"
        >
          {t('query.liteActions.clear.label')}
        </EmptyButton>
      </RiTooltip>

      <RiTooltip
        position="left"
        content={isLoading ? t('query.executing') : KeyBoardTooltipContent}
        data-testid="run-query-tooltip"
      >
        <RunButton onSubmit={onSubmit} isLoading={isLoading} />
      </RiTooltip>
    </>
  )
}

export default QueryLiteActions
