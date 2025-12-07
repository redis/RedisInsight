import React from 'react'

import { CommandGroup, GROUP_TYPES_COLORS, KeyTypes } from 'uiSrc/constants'
import { getGroupTypeDisplay } from 'uiSrc/utils'

import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'

import { DeleteButton, StyledGroupBadge } from './GroupBadge.styles'

export interface Props {
  type: KeyTypes | CommandGroup | string
  name?: string
  className?: string
  compressed?: boolean
  onDelete?: (type: string) => void
}

const GroupBadge = ({
  type,
  name = '',
  className = '',
  onDelete,
  compressed,
}: Props) => {
  // @ts-ignore
  const backgroundColor = GROUP_TYPES_COLORS[type] ?? 'var(--defaultTypeColor)'
  return (
    <StyledGroupBadge
      $withDeleteBtn={!!onDelete}
      $compressed={!!compressed}
      variant="light"
      $color={backgroundColor}
      className={className}
      title={undefined}
      data-testid={`badge-${type}_${name}`}
    >
      {!compressed && (
        <Text
          color="#ffffff"
          className="text-uppercase"
          variant="semiBold"
          size="S"
          component="span"
        >
          {getGroupTypeDisplay(type)}
        </Text>
      )}
      {onDelete && (
        <DeleteButton
          size="XS"
          icon={CancelSlimIcon}
          aria-label="Delete"
          onClick={() => onDelete(type)}
          data-testid={`${type}-delete-btn`}
        />
      )}
    </StyledGroupBadge>
  )
}

export default GroupBadge
