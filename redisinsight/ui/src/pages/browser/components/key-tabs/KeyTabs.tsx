import React, { useEffect, useRef } from 'react'

import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import {
  bufferToString,
  formatLongName,
  isEqualBuffers,
  Nullable,
  replaceSpaces,
} from 'uiSrc/utils'
import { KeyboardKeys } from 'uiSrc/constants/keys'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { RiTooltip } from 'uiSrc/components'
import { useTranslation } from 'uiSrc/i18n'

import * as S from './KeyTabs.styles'

const MIDDLE_MOUSE_BUTTON = 1

export interface KeyTabsProps {
  tabs: RedisResponseBuffer[]
  activeKey: Nullable<RedisResponseBuffer>
  onSelectTab: (key: RedisResponseBuffer) => void
  onCloseTab: (key: RedisResponseBuffer) => void
}

export const KeyTabs = ({
  tabs,
  activeKey,
  onSelectTab,
  onCloseTab,
}: KeyTabsProps) => {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [activeKey, tabs.length])

  if (!tabs.length) return null

  return (
    <S.TabsContainer ref={containerRef} role="tablist" data-testid="key-tabs">
      {tabs.map((tab, index) => {
        const name = bufferToString(tab)
        const isActive = isEqualBuffers(tab, activeKey)

        const handleClose = (e: React.MouseEvent) => {
          e.stopPropagation()
          onCloseTab(tab)
        }

        const handleMouseUp = (e: React.MouseEvent) => {
          if (e.button === MIDDLE_MOUSE_BUTTON) {
            e.preventDefault()
            onCloseTab(tab)
          }
        }

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (
            e.target === e.currentTarget &&
            (e.key === KeyboardKeys.ENTER || e.key === KeyboardKeys.SPACE)
          ) {
            e.preventDefault()
            onSelectTab(tab)
          }
        }

        return (
          <S.Tab
            key={`${name}-${index}`}
            role="tab"
            tabIndex={0}
            aria-selected={isActive}
            align="center"
            gap="s"
            $isActive={isActive}
            onClick={() => onSelectTab(tab)}
            onMouseUp={handleMouseUp}
            onKeyDown={handleKeyDown}
            data-testid={`key-tab-${name}`}
          >
            <RiTooltip
              content={formatLongName(name)}
              position="bottom"
              anchorClassName="truncateText"
            >
              <span>{replaceSpaces(name)}</span>
            </RiTooltip>
            <IconButton
              icon={CancelSlimIcon}
              aria-label={t('browser.keyTabs.closeAria', { name })}
              onClick={handleClose}
              data-testid={`close-key-tab-${name}`}
            />
          </S.Tab>
        )
      })}
    </S.TabsContainer>
  )
}
