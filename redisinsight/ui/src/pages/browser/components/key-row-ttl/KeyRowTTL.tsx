import React from 'react'
import cx from 'classnames'
import { isUndefined } from 'lodash'

import { RiTooltip } from 'uiSrc/components'
import { LoadingContent } from 'uiSrc/components/base/layout'
import { ColorText, Text } from 'uiSrc/components/base/text'
import {
  Maybe,
  truncateNumberToDuration,
  truncateNumberToFirstUnit,
  truncateTTLToSeconds,
} from 'uiSrc/utils'
import { useTranslation } from 'uiSrc/i18n'
import styles from './styles.module.scss'

export interface Props {
  ttl: Maybe<number>
  deletePopoverId: Maybe<number | string>
  rowId: number | string
  nameString: string
}

const KeyRowTTL = (props: Props) => {
  const { ttl, nameString, deletePopoverId, rowId } = props
  const { t } = useTranslation()

  if (isUndefined(ttl)) {
    return (
      <LoadingContent
        lines={1}
        className={cx(styles.keyInfoLoading, styles.keyTTL)}
        data-testid={`ttl-loading_${nameString}`}
      />
    )
  }
  if (ttl === -1) {
    return (
      <ColorText
        className={cx(styles.keyTTL, 'moveOnHoverKey', {
          hide: deletePopoverId === rowId,
        })}
        color="secondary"
        data-testid={`ttl-${nameString}`}
      >
        {t('browser.keyList.ttl.noLimit')}
      </ColorText>
    )
  }
  return (
    <Text
      component="div"
      className={cx(styles.keyTTL, 'moveOnHoverKey', {
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
          title={t('browser.keyList.ttl.tooltipTitle')}
          className={styles.tooltip}
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
    </Text>
  )
}

export default KeyRowTTL
