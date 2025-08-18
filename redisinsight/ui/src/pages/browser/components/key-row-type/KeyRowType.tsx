import React from 'react'
import cx from 'classnames'

import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { GroupBadge, RiLoadingContent } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  nameString: string
  type: KeyTypes | ModulesKeyTypes
}

const KeyRowType = (props: Props) => {
  const { nameString, type } = props

  return (
    <>
      {!type && (
        <RiLoadingContent
          lines={1}
          className={cx(styles.keyInfoLoading, styles.keyType)}
          data-testid={`type-loading_${nameString}`}
        />
      )}
      {!!type && (
        <div className={styles.keyType}>
          <GroupBadge type={type} name={nameString} />
        </div>
      )}
    </>
  )
}

export default KeyRowType
