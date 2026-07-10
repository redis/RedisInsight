import React, { useCallback } from 'react'
import { IconButton } from '@redis-ui/components'

import { useTranslation } from 'uiSrc/i18n'
import { Button } from 'uiSrc/components/base/forms/buttons'

import { ActionsCellProps } from '../../IndexList.types'
import {
  Menu,
  MenuContent,
  MenuDropdownArrow,
  MenuItem,
  MenuTrigger,
} from 'uiSrc/components/base/layout/menu'
import { MoreactionsIcon } from 'uiSrc/components/base/icons'
import { Row } from 'uiSrc/components/base/layout/flex'

export const ActionsCell = ({
  row,
  onQueryClick,
  actions = [],
}: ActionsCellProps) => {
  const { t } = useTranslation()
  const { id, name } = row

  const handleQueryClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      onQueryClick?.(name)
    },
    [onQueryClick, name],
  )

  return (
    <Row
      wrap
      data-testid={`index-actions-${id}`}
      gap="m"
      align="center"
      justify="center"
    >
      {onQueryClick && (
        <Button
          size="small"
          onClick={handleQueryClick}
          data-testid={`index-query-btn-${id}`}
        >
          {t('vectorSearch.list.action.query')}
        </Button>
      )}
      {actions.length > 0 && (
        <Menu data-testid={`index-actions-menu-${id}`}>
          <MenuTrigger>
            <IconButton
              icon={MoreactionsIcon}
              size="L"
              data-testid={`index-actions-menu-trigger-${id}`}
            />
          </MenuTrigger>
          <MenuContent placement="bottom" align="end">
            {actions.map((action) => {
              const handleActionClick = (e: React.MouseEvent) => {
                e.stopPropagation()
                action.callback(name)
              }
              return (
                <MenuItem
                  key={action.name}
                  icon={action.icon}
                  variant={action.variant}
                  text={action.label ?? action.name}
                  onClick={handleActionClick}
                  data-testid={`index-actions-${action.name.toLowerCase()}-btn-${id}`}
                />
              )
            })}
            <MenuDropdownArrow />
          </MenuContent>
        </Menu>
      )}
    </Row>
  )
}
