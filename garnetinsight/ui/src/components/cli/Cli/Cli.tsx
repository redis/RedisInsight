import React from 'react'

import CliHeader from 'uiSrc/components/cli/components/cli-header'
import CliBodyWrapper from 'uiSrc/components/cli/components/cli-body'
import styles from './styles.module.scss'

const CLI = () => (
  <div className={styles.container} data-testid="cli">
    <div className={styles.main}>
      <CliHeader />
      <CliBodyWrapper />
    </div>
  </div>
)

export default CLI
