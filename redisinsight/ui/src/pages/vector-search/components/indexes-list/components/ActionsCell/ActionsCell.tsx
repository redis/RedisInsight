import React, { useCallback } from 'react'

import { Button } from 'uiSrc/components/base/forms/buttons'
import { IconButton } from '@redis-ui/components'

import { ActionsCellProps } from '../../IndexesList.types'
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
          Query
        </Button>
      )}
      {actions.length > 0 && (
        <Menu data-testid={`index-actions-menu-${id}`}>
          <MenuTrigger>
            <IconButton icon={MoreactionsIcon} size="L" />
          </MenuTrigger>
          <MenuContent placement="right" align="start">
            {actions.map((action) => {
              const handleActionClick = (e: React.MouseEvent) => {
                e.stopPropagation()
                action.callback(name)
              }
              return (
                <MenuItem
                  key={action.name}
                  text={action.name}
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
