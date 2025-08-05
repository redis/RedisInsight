import React from 'react'

import { RiLoadingContent } from 'uiSrc/components/base/layout'
import styles from './styles.module.scss'

const TableLoader = () => (
  <div className={styles.container} data-testid="table-loader">
    <RiLoadingContent className={styles.title} lines={1} />
    <RiLoadingContent className={styles.table} lines={3} />
  </div>
)

export default TableLoader
