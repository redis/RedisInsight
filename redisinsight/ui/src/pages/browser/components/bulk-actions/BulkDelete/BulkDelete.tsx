import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { isUndefined } from 'lodash'
import { RiText } from 'uiBase/text'
import {
  bulkActionsDeleteOverviewSelector,
  bulkActionsDeleteSelector,
  bulkActionsDeleteSummarySelector,
} from 'uiSrc/slices/browser/bulkActions'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { getGroupTypeDisplay, NO_TYPE_NAME } from 'uiSrc/utils'

import BulkDeleteFooter from './BulkDeleteFooter'
import BulkDeleteSummary from './BulkDeleteSummary'
import BulkDeleteSummaryButton from './BulkDeleteSummaryButton'
import BulkActionsInfo from '../BulkActionsInfo'

import styles from './styles.module.scss'

export interface Props {
  onCancel: () => void
}

const REPORTED_NO_TYPE_NAME = 'Any'

const BulkDelete = (props: Props) => {
  const { onCancel } = props
  const { filter, search, isSearched, isFiltered } = useSelector(keysSelector)
  const { loading } = useSelector(bulkActionsDeleteSelector)
  const { keys: deletedKeys } =
    useSelector(bulkActionsDeleteSummarySelector) || {}
  const {
    status,
    filter: { match, type: filterType },
    progress,
  } = useSelector(bulkActionsDeleteOverviewSelector) ?? { filter: {} }

  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(
    !isSearched && !isFiltered,
  )

  useEffect(() => {
    setShowPlaceholder(!status && !isSearched && !isFiltered)
  }, [status, isSearched, isFiltered])

  const isCompleted = !isUndefined(status)
  const searchPattern = match || search || '*'
  const keysType = getGroupTypeDisplay(filter)

  return (
    <>
      {!showPlaceholder && (
        <>
          <BulkActionsInfo
            search={searchPattern}
            loading={loading}
            filter={isUndefined(filterType) ? filter : filterType}
            status={status}
            progress={progress}
          >
            <BulkDeleteSummary />

            {isCompleted && (
              <div className={styles.bulkDeleteSummaryButtonWrapper}>
                <BulkDeleteSummaryButton
                  deletedKeys={deletedKeys}
                  pattern={searchPattern}
                  keysType={
                    keysType === NO_TYPE_NAME ? REPORTED_NO_TYPE_NAME : keysType
                  }
                >
                  Keys deleted
                </BulkDeleteSummaryButton>
              </div>
            )}
          </BulkActionsInfo>
          <BulkDeleteFooter onCancel={onCancel} />
        </>
      )}

      {showPlaceholder && (
        <div
          className={styles.placeholder}
          data-testid="bulk-actions-placeholder"
        >
          <RiText color="subdued" className={styles.placeholderTitle}>
            No pattern or key type set
          </RiText>
          <RiText color="subdued" className={styles.placeholderSummary}>
            To perform a bulk action, set the pattern or select the key type
          </RiText>
        </div>
      )}
    </>
  )
}

export default BulkDelete
