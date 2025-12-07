import React from 'react'

import Divider from 'uiSrc/components/divider/Divider'

import styles from './styles.module.scss'

const VerticalDivider = (props: any) => (
  <Divider
    className={styles.divider}
    orientation="vertical"
    {...props}
  />
)

export default VerticalDivider
