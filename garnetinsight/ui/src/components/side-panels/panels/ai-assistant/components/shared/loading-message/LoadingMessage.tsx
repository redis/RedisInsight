import React from 'react'

import styles from './styles.module.scss'

const LoadingMessage = () => (
  <div className={styles.loader}>
    {/* eslint-disable-next-line react/no-array-index-key */}
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={`dot_${i}`} className={styles.dot} />
    ))}
  </div>
)

export default LoadingMessage
