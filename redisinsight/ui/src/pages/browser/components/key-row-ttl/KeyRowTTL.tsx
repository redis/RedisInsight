import React from 'react'
import cx from 'classnames'
import { isUndefined } from 'lodash'

import { RiTooltip } from 'uiSrc/components'
import { LoadingContent } from 'uiSrc/components/base/layout'
import {
  Maybe,
  truncateNumberToDuration,
  truncateNumberToFirstUnit,
  truncateTTLToSeconds,
} from 'uiSrc/utils'

import * as S from './KeyRowTTL.styles'

export interface Props {
  ttl: Maybe<number>
  deletePopoverId: Maybe<number | string>
  rowId: number | string
  nameString: string
}

const KeyRowTTL = (props: Props) => {
  const { ttl, nameString, deletePopoverId, rowId } = props

  if (isUndefined(ttl)) {
    return (
      <S.KeyInfoLoading>
        <LoadingContent lines={1} data-testid={`ttl-loading_${nameString}`} />
      </S.KeyInfoLoading>
    )
  }
  if (ttl === -1) {
    return (
      <S.KeyTTLColorText
        className={cx('moveOnHoverKey', {
          hide: deletePopoverId === rowId,
        })}
        color="secondary"
        data-testid={`ttl-${nameString}`}
      >
        No limit
      </S.KeyTTLColorText>
    )
  }
  return (
    <S.KeyTTLText
      component="div"
      className={cx('moveOnHoverKey', {
        hide: deletePopoverId === rowId,
      })}
      color="secondary"
      size="s"
    >
      <div
        style={{ display: 'flex' }}
        className="truncateText"
        data-testid={`ttl-${nameString}`}
      >
        <RiTooltip
          title="Time to Live"
          anchorClassName="truncateText"
          position="right"
          content={
            <>
              {`${truncateTTLToSeconds(ttl)} s`}
              <br />
              {`(${truncateNumberToDuration(ttl)})`}
            </>
          }
        >
          <>{truncateNumberToFirstUnit(ttl)}</>
        </RiTooltip>
      </div>
    </S.KeyTTLText>
  )
}

export default KeyRowTTL
