import React from 'react'
import CodeIcon from 'uiSrc/assets/img/code-changes.svg?react'
import ConfigurationIcon from 'uiSrc/assets/img/configuration-changes.svg?react'
import UpgradeIcon from 'uiSrc/assets/img/upgrade.svg?react'

import styles from './styles.module.scss'

export const badgesContent = [
  {
    id: 'code_changes',
    icon: <CodeIcon className={styles.badgeIcon} />,
    name: 'Code Changes',
  },
  {
    id: 'configuration_changes',
    icon: <ConfigurationIcon className={styles.badgeIcon} />,
    name: 'Configuration Changes',
  },
  {
    id: 'upgrade',
    icon: <UpgradeIcon className={styles.badgeIcon} />,
    name: 'Upgrade',
  },
]
