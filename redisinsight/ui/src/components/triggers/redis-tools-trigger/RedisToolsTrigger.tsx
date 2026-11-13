import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  sidePanelsSelector,
  toggleSidePanel,
} from 'uiSrc/slices/panels/sidePanels'
import { SidePanels } from 'uiSrc/slices/interfaces/insights'
import { CommandLineIcon } from 'uiSrc/components/base/icons'

import * as S from './RedisToolsTrigger.styles'

const RedisToolsTrigger = () => {
  const { t } = useTranslation()
  const { openedPanel } = useAppSelector(sidePanelsSelector)
  const dispatch = useAppDispatch()

  const isRedisToolsOpen = openedPanel === SidePanels.RedisTools

  const handleClickTrigger = () => {
    dispatch(toggleSidePanel(SidePanels.RedisTools))
  }

  return (
    <S.RedisToolsWrapper align="center" justify="end" gap="s">
      <S.TriggerButton
        $isOpen={isRedisToolsOpen}
        icon={CommandLineIcon}
        onClick={handleClickTrigger}
        aria-pressed={isRedisToolsOpen}
        data-testid="redis-tools-trigger"
      >
        {t('redisTools.trigger.label')}
        <S.NewBadge
          variant="attention"
          label={t('redisTools.trigger.badge')}
          data-testid="redis-tools-trigger-badge"
        />
      </S.TriggerButton>
    </S.RedisToolsWrapper>
  )
}

export default RedisToolsTrigger
