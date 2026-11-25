import React, { useEffect, useRef } from 'react'

import { KeyTab, RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import {
  formatLongName,
  isEqualBuffers,
  Nullable,
  replaceSpaces,
} from 'uiSrc/utils'
import { KeyboardKeys } from 'uiSrc/constants/keys'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { RiTooltip } from 'uiSrc/components'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { useTranslation } from 'uiSrc/i18n'

import { useKeyFormat } from '../use-key-format'
import * as S from './KeyTabs.styles'

const MIDDLE_MOUSE_BUTTON = 1

export interface KeyTabsProps {
  tabs: KeyTab[]
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
  // same as the key list: HEX keeps binary key names distinguishable
  const { handler: formatKeyName } = useKeyFormat()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [activeKey, tabs.length])

  if (!tabs.length) return null

  return (
    <S.TabsContainer ref={containerRef} role="tablist" data-testid="key-tabs">
      {tabs.map(({ key, removedReason }, index) => {
        const name = formatKeyName(key)
        const isActive = isEqualBuffers(key, activeKey)
        const isRemoved = removedReason !== null

        const handleClose = (e: React.MouseEvent) => {
          e.stopPropagation()
          onCloseTab(key)
        }

        const handleMouseUp = (e: React.MouseEvent) => {
          if (e.button === MIDDLE_MOUSE_BUTTON) {
            e.preventDefault()
            onCloseTab(key)
          }
        }

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (
            e.target === e.currentTarget &&
            (e.key === KeyboardKeys.ENTER || e.key === KeyboardKeys.SPACE)
          ) {
            e.preventDefault()
            onSelectTab(key)
          }

          if (
            e.target !== e.currentTarget ||
            ![
              KeyboardKeys.ARROW_LEFT,
              KeyboardKeys.ARROW_RIGHT,
              KeyboardKeys.HOME,
              KeyboardKeys.END,
            ].includes(e.key as KeyboardKeys)
          ) {
            return
          }

          e.preventDefault()
          const tabElements =
            containerRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')
          if (!tabElements?.length) return

          const nextIndex =
            e.key === KeyboardKeys.HOME
              ? 0
              : e.key === KeyboardKeys.END
                ? tabElements.length - 1
                : (index +
                    (e.key === KeyboardKeys.ARROW_RIGHT ? 1 : -1) +
                    tabElements.length) %
                  tabElements.length
          tabElements[nextIndex]?.focus()
        }

        const removedMessage = t('browser.keyTabs.notFoundMessage')

        return (
          <S.Tab
            key={`${name}-${index}`}
            role="tab"
            tabIndex={isActive || (!activeKey && index === 0) ? 0 : -1}
            aria-selected={isActive}
            align="center"
            gap="s"
            $isActive={isActive}
            $isRemoved={isRemoved}
            onClick={() => onSelectTab(key)}
            onMouseUp={handleMouseUp}
            onKeyDown={handleKeyDown}
            data-testid={`key-tab-${name}`}
          >
            <RiTooltip
              title={isRemoved ? removedMessage : undefined}
              content={formatLongName(name)}
              position="bottom"
              anchorClassName="truncateText"
            >
              <span>{replaceSpaces(name)}</span>
            </RiTooltip>
            {isRemoved && (
              <RiBadge
                variant="danger"
                label={t('browser.keyTabs.notFound')}
                data-testid={`key-tab-not-found-${name}`}
              />
            )}
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
