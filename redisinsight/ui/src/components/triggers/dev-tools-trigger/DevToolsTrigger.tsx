import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  sidePanelsSelector,
  toggleSidePanel,
} from 'uiSrc/slices/panels/sidePanels'
import { SidePanels } from 'uiSrc/slices/interfaces/insights'
import { CommandLineIcon } from 'uiSrc/components/base/icons'

import * as S from './DevToolsTrigger.styles'

const DevToolsTrigger = () => {
  const { t } = useTranslation()
  const { openedPanel } = useAppSelector(sidePanelsSelector)
  const dispatch = useAppDispatch()

  const isDevToolsOpen = openedPanel === SidePanels.DevTools

  const handleClickTrigger = () => {
    dispatch(toggleSidePanel(SidePanels.DevTools))
  }

  return (
    <S.DevToolsWrapper align="center" justify="end" gap="s">
      <S.TriggerButton
        $isOpen={isDevToolsOpen}
        icon={CommandLineIcon}
        onClick={handleClickTrigger}
        aria-pressed={isDevToolsOpen}
        data-testid="dev-tools-trigger"
      >
        {t('devTools.trigger.label')}
        <S.NewBadge
          variant="attention"
          label={t('devTools.trigger.badge')}
          data-testid="dev-tools-trigger-badge"
        />
      </S.TriggerButton>
    </S.DevToolsWrapper>
  )
}

export default DevToolsTrigger
