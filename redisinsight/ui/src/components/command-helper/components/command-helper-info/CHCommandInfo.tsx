import React from 'react'

import { GroupBadge } from 'uiSrc/components'
import { CommandGroup } from 'uiSrc/constants'

import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { ArrowLeftIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { Row } from 'uiSrc/components/base/layout/flex'

import styles from './styles.module.scss'
import { HorizontalSpacer } from 'uiSrc/components/base/layout'

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
    <Row
      align="center"
      className={styles.container}
      data-testid="cli-helper-title"
    >
      <IconButton
        icon={ArrowLeftIcon}
        onClick={onBackClick}
        data-testid="cli-helper-back-to-list-btn"
        style={{ marginRight: '4px' }}
      />
      <GroupBadge type={group} />
      <HorizontalSpacer size="s" />
      <Text
        data-testid="cli-helper-title-args"
        variant="semiBold"
        color="primary"
      >
        {args}
      </Text>
      {complexity && (
        <RiBadge
          label={complexity}
          variant="light"
          className={styles.badge}
          data-testid="cli-helper-complexity-short"
        />
      )}
    </Row>
  )
}

export default CHCommandInfo
