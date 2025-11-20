import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { isUndefined } from 'lodash'
import { Text } from 'uiSrc/components/base/text'
import {
  bulkActionsDeleteOverviewSelector,
  bulkActionsDeleteSelector,
  bulkActionsDeleteSummarySelector,
} from 'uiSrc/slices/browser/bulkActions'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { getGroupTypeDisplay, NO_TYPE_NAME } from 'uiSrc/utils'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

import BulkDeleteFooter from './BulkDeleteFooter'
import BulkDeleteSummary from './BulkDeleteSummary'
import BulkDeleteSummaryButton from './BulkDeleteSummaryButton'
import BulkActionsInfo from '../BulkActionsInfo'

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
            <Col gap="l">
              <BulkDeleteSummary />

              {isCompleted && (
                <Row justify="end">
                  <BulkDeleteSummaryButton
                    deletedKeys={deletedKeys}
                    pattern={searchPattern}
                    keysType={
                      keysType === NO_TYPE_NAME
                        ? REPORTED_NO_TYPE_NAME
                        : keysType
                    }
                  >
                    Keys deleted
                  </BulkDeleteSummaryButton>
                </Row>
              )}
            </Col>
          </BulkActionsInfo>
          <BulkDeleteFooter onCancel={onCancel} />
        </>
      )}

      {showPlaceholder && (
        <Col
          gap="l"
          justify="center"
          align="center"
          data-testid="bulk-actions-placeholder"
        >
          <Text size="XL" color="primary" variant="semiBold">
            No pattern or key type set
          </Text>
          <Text color="secondary">
            To perform a bulk action, set the pattern or select the key type
          </Text>
        </Col>
      )}
    </>
  )
}

export default BulkDelete
