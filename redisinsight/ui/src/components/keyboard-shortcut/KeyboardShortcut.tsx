import React from 'react'
import { isString } from 'lodash'
import cx from 'classnames'

import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'

import * as S from './KeyboardShortcut.styles'

export interface Props {
  items: (string | JSX.Element)[]
  separator?: string
  transparent?: boolean
  badgeTextClassName?: string
}

const KeyboardShortcut = (props: Props) => {
  const {
    items = [],
    separator = '',
    transparent = false,
    badgeTextClassName = '',
  } = props
  return (
    <S.Container>
      {items.map((item: string | JSX.Element, index: number) => (
        <div key={isString(item) ? item : item?.props?.children}>
          {index !== 0 && <S.Separator>{separator}</S.Separator>}
          <S.Badge
            as={RiBadge}
            className={cx(badgeTextClassName)}
            $transparent={transparent}
            label={item}
          />
        </div>
      ))}
    </S.Container>
  )
}
export default KeyboardShortcut
