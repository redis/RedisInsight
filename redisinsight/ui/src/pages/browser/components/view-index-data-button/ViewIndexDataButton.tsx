import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { ChevronDownIcon } from 'uiSrc/components/base/icons'
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from 'uiSrc/components/base/layout/menu'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  SearchBrowserSource,
  SearchIndexDetailsSource,
} from 'uiSrc/pages/vector-search/telemetry.constants'
import { OPEN_INDEX_PANEL_PARAM } from 'uiSrc/pages/vector-search/pages/VectorSearchQueryPage/VectorSearchQueryPage.constants'

import { useTranslation } from 'uiSrc/i18n'
import { ViewIndexDataButtonProps } from './ViewIndexDataButton.types'
import * as S from './ViewIndexDataButton.styles'

export const ViewIndexDataButton = ({
  indexes,
  instanceId,
  onNavigate,
}: ViewIndexDataButtonProps) => {
  const { t } = useTranslation()
  const history = useHistory()

  const navigateTo = useCallback(
    (indexName: string) => {
      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_VIEW_INDEX_CLICKED,
        eventData: {
          databaseId: instanceId,
          numberOfIndexes: indexes.length,
          source: SearchBrowserSource.KeyDetails,
        },
      })
      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_INDEX_DETAILS_VIEWED,
        eventData: {
          databaseId: instanceId,
          source: SearchIndexDetailsSource.KeyDetails,
        },
      })
      if (onNavigate) {
        onNavigate(indexName)
        return
      }
      history.push({
        pathname: Pages.vectorSearchQuery(
          instanceId,
          encodeURIComponent(indexName),
        ),
        search: new URLSearchParams({
          [OPEN_INDEX_PANEL_PARAM]: 'true',
        }).toString(),
      })
    },
    [history, instanceId, onNavigate, indexes.length],
  )

  if (indexes.length === 0) {
    return null
  }

  if (indexes.length === 1) {
    return (
      <EmptyButton
        size="small"
        onClick={() => navigateTo(indexes[0].name)}
        data-testid="view-index-data-btn"
      >
        {t('browser.viewIndex.label')}
      </EmptyButton>
    )
  }

  return (
    <Menu data-testid="view-index-data-menu">
      <MenuTrigger>
        <EmptyButton size="small" data-testid="view-index-data-menu-trigger">
          <S.TriggerRow gap="s" align="center">
            {t('browser.viewIndex.label')}
            <S.CountBadge
              grow={false}
              centered
              data-testid="view-index-data-count-badge"
            >
              <S.CountBadgeText size="s" color="primary" variant="semiBold">
                {indexes.length}
              </S.CountBadgeText>
            </S.CountBadge>
            <ChevronDownIcon size="S" />
          </S.TriggerRow>
        </EmptyButton>
      </MenuTrigger>
      <MenuContent placement="bottom" align="end">
        {indexes.map((index) => (
          <MenuItem
            key={index.name}
            text={index.name}
            onClick={() => navigateTo(index.name)}
            data-testid={`view-index-data-item-${index.name}`}
          />
        ))}
      </MenuContent>
    </Menu>
  )
}
