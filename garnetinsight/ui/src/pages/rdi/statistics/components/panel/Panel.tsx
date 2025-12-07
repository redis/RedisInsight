import React from 'react'

import styles from './styles.module.scss'

interface Props {
  children: string | JSX.Element
}

const Panel = ({ children }: Props) => (
  <div className={styles.panel}>{children}</div>
)

export default Panel
