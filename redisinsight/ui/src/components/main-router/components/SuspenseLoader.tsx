import React from 'react'
import { RiLoader } from 'uiBase/display'
import styles from './loader.module.scss'

const SuspenseLoader = () => (
  <div className={styles.cover} data-testid="suspense-loader">
    <RiLoader size="xl" className={styles.loader} />
  </div>
)

export default SuspenseLoader
