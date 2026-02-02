import React from 'react'

import { GroupBadge } from 'uiSrc/components'
import { CommandGroup } from 'uiSrc/constants'

import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { ArrowLeftIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { Row } from 'uiSrc/components/base/layout/flex'
import { HorizontalSpacer } from 'uiSrc/components/base/layout'

import * as S from '../../CommandHelper.styles'

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
    <S.InfoContainer as={Row} align="center" data-testid="cli-helper-title">
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
        <S.InfoBadge
          as={RiBadge}
          label={complexity}
          variant="light"
          data-testid="cli-helper-complexity-short"
        />
      )}
    </S.InfoContainer>
  )
}

export default CHCommandInfo
