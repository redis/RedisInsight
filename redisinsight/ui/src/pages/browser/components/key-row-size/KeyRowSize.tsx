import React from 'react'
import cx from 'classnames'
import { isUndefined } from 'lodash'

import { LoadingContent } from 'uiSrc/components/base/layout'
import { Maybe, formatBytes } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components'

import * as S from './KeyRowSize.styles'

export interface Props {
  size: Maybe<number>
  deletePopoverId: Maybe<number | string>
  rowId: number | string
  nameString: string
}

const KeyRowSize = (props: Props) => {
  const { size, nameString, deletePopoverId, rowId } = props

  if (isUndefined(size)) {
    return (
      <S.KeyInfoLoading>
        <LoadingContent lines={1} data-testid={`size-loading_${nameString}`} />
      </S.KeyInfoLoading>
    )
  }

  if (!size) {
    return (
      <S.KeySizeText
        component="div"
        color="secondary"
        size="s"
        data-testid={`size-${nameString}`}
      >
        -
      </S.KeySizeText>
    )
  }
  return (
    <S.KeySizeText
      component="div"
      color="secondary"
      size="s"
      className={cx('moveOnHoverKey', {
        hide: deletePopoverId === rowId,
      })}
      style={{ maxWidth: '100%' }}
    >
      <div
        style={{ display: 'flex' }}
        className="truncateText"
        data-testid={`size-${nameString}`}
      >
        <RiTooltip
          title="Key Size"
          anchorClassName="truncateText"
          position="right"
          content={<>{formatBytes(size, 3)}</>}
        >
          <>{formatBytes(size, 0)}</>
        </RiTooltip>
      </div>
    </S.KeySizeText>
  )
}

export default KeyRowSize
