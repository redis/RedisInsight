import React from 'react'
import cx from 'classnames'

import VirtualList from 'uiSrc/components/virtual-list'

import styles from './styles.module.scss'

export interface Props {
  items: (string | JSX.Element)[]
  isFullScreen?: boolean
}

export const MIN_ROWS_COUNT = 11
export const MAX_CARD_HEIGHT = 210

const QueryCardCliDefaultResult = (props: Props) => {
  const { items = [], isFullScreen } = props

  return (
    <div
      className={cx(styles.container, 'query-card-output-response-success', {
        fullscreen: isFullScreen,
      })}
      data-testid="query-cli-card-result"
    >
      <VirtualList
        items={items}
        dynamicHeight={
          !isFullScreen
            ? { itemsCount: MIN_ROWS_COUNT, maxHeight: MAX_CARD_HEIGHT }
            : undefined
        }
      />
    </div>
  )
}

export default QueryCardCliDefaultResult
