import React from 'react'
import { Loader } from 'uiSrc/components/base/display'
import styles from './loader.module.scss'

const SuspenseLoader = () => (
  <div className={styles.cover} data-testid="suspense-loader">
    <Loader size="xl" className={styles.loader} />
  </div>
)

export default SuspenseLoader
