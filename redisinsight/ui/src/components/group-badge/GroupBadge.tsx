import cx from 'classnames'
import React from 'react'

import { RiIconButton } from 'uiBase/forms'
import { CancelSlimIcon } from 'uiBase/icons'
import { RiText } from 'uiBase/text'
import { RiBadge } from 'uiBase/display'
import { getGroupTypeDisplay } from 'uiSrc/utils'
import { CommandGroup, KeyTypes, GROUP_TYPES_COLORS } from 'uiSrc/constants'

import styles from './styles.module.scss'

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
    <RiBadge
      variant="light"
      style={{
        backgroundColor,
      }}
      className={cx(styles.badgeWrapper, className, {
        [styles.withDeleteBtn]: onDelete,
        [styles.compressed]: compressed,
      })}
      title={undefined}
      data-testid={`badge-${type}_${name}`}
    >
      {!compressed && (
        <RiText
          style={{ color: 'var(--euiTextSubduedColorHover)' }}
          className="text-uppercase"
          size="xs"
        >
          {getGroupTypeDisplay(type)}
        </RiText>
      )}
      {onDelete && (
        <RiIconButton
          size="XS"
          icon={CancelSlimIcon}
          color="primary"
          aria-label="Delete"
          onClick={() => onDelete(type)}
          className={styles.deleteIcon}
          data-testid={`${type}-delete-btn`}
        />
      )}
    </RiBadge>
  )
}

export default GroupBadge
