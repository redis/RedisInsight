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

import { ViewIndexDataButtonProps } from './ViewIndexDataButton.types'
import * as S from './ViewIndexDataButton.styles'

const VIEW_INDEX_LABEL = 'View index'

export const ViewIndexDataButton = ({
  indexes,
  instanceId,
  onNavigate,
}: ViewIndexDataButtonProps) => {
  const history = useHistory()

  const navigateTo = useCallback(
    (indexName: string) => {
      if (onNavigate) {
        onNavigate(indexName)
        return
      }
      history.push(
        Pages.vectorSearchQuery(instanceId, encodeURIComponent(indexName)),
      )
    },
    [history, instanceId, onNavigate],
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
        {VIEW_INDEX_LABEL}
      </EmptyButton>
    )
  }

  return (
    <Menu data-testid="view-index-data-menu">
      <MenuTrigger>
        <EmptyButton size="small" data-testid="view-index-data-menu-trigger">
          <S.TriggerRow gap="s" align="center">
            {VIEW_INDEX_LABEL}
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
