import React from 'react'
import CodeIcon from 'uiSrc/assets/img/code-changes.svg?react'
import ConfigurationIcon from 'uiSrc/assets/img/configuration-changes.svg?react'
import UpgradeIcon from 'uiSrc/assets/img/upgrade.svg?react'

import * as S from './Recommendation.styles'

export const badgesContent = [
  {
    id: 'code_changes',
    icon: (
      <S.BadgeIcon>
        <CodeIcon />
      </S.BadgeIcon>
    ),
    name: 'Code Changes',
  },
  {
    id: 'configuration_changes',
    icon: (
      <S.BadgeIcon>
        <ConfigurationIcon />
      </S.BadgeIcon>
    ),
    name: 'Configuration Changes',
  },
  {
    id: 'upgrade',
    icon: (
      <S.BadgeIcon>
        <UpgradeIcon />
      </S.BadgeIcon>
    ),
    name: 'Upgrade',
  },
]
