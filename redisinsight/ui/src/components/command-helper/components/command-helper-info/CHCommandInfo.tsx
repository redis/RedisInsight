import React from 'react'

import { RiIconButton } from 'uiBase/forms'
import { ArrowLeftIcon } from 'uiBase/icons'
import { RiColorText } from 'uiBase/text'
import { RiBadge } from 'uiBase/display'
import { RiRow } from 'uiBase/layout'
import { CommandGroup } from 'uiSrc/constants'
import { GroupBadge } from 'uiSrc/components'

import styles from './styles.module.scss'

export interface Props {
  args: string
  group: CommandGroup | string
  complexity: string
  onBackClick: () => void
}

const CHCommandInfo = (props: Props) => {
  const {
    args = '',
    group = CommandGroup.Generic,
    complexity = '',
    onBackClick,
  } = props

  return (
    <RiRow
      align="center"
      className={styles.container}
      data-testid="cli-helper-title"
    >
      <RiIconButton
        icon={ArrowLeftIcon}
        onClick={onBackClick}
        data-testid="cli-helper-back-to-list-btn"
        style={{ marginRight: '4px' }}
      />
      <GroupBadge type={group} className={styles.groupBadge} />
      <RiColorText
        className={styles.title}
        color="subdued"
        data-testid="cli-helper-title-args"
      >
        {args}
      </RiColorText>
      {complexity && (
        <RiBadge
          label={complexity}
          variant="light"
          className={styles.badge}
          data-testid="cli-helper-complexity-short"
        />
      )}
    </RiRow>
  )
}

export default CHCommandInfo
