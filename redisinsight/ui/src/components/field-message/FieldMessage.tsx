import React, { Ref, useEffect, useRef } from 'react'
import cx from 'classnames'

import { RiColorText } from 'uiBase/text'
import { AllIconsType, RiIcon } from 'uiBase/icons'
import { scrollIntoView } from 'uiSrc/utils'
import styles from './styles.module.scss'

type Colors =
  | 'default'
  | 'secondary'
  | 'accent'
  | 'warning'
  | 'danger'
  | 'subdued'
  | 'ghost'
export interface Props {
  children: React.ReactElement | string
  color?: Colors
  scrollViewOnAppear?: boolean
  icon?: AllIconsType
  testID?: string
}

const FieldMessage = ({
  children,
  color,
  testID,
  icon,
  scrollViewOnAppear,
}: Props) => {
  const divRef: Ref<HTMLDivElement> = useRef(null)

  useEffect(() => {
    // componentDidMount
    if (scrollViewOnAppear) {
      scrollIntoView(divRef?.current, {
        behavior: 'smooth',
        block: 'nearest',
        inline: 'end',
      })
    }
  }, [])

  return (
    <div ref={divRef} className={cx(styles.container)}>
      {icon && (
        <RiIcon
          className={cx(styles.icon)}
          type={icon}
          color={color || 'danger'}
        />
      )}
      <RiColorText
        className={cx(styles.message)}
        data-testid={testID}
        color={color || 'danger'}
      >
        {children}
      </RiColorText>
    </div>
  )
}

export default FieldMessage
