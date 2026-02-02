import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { isUndefined } from 'lodash'
import { Text } from 'uiSrc/components/base/text'
import {
  bulkActionsDeleteOverviewSelector,
  bulkActionsDeleteSelector,
} from 'uiSrc/slices/browser/bulkActions'
import { Col } from 'uiSrc/components/base/layout/flex'

import BulkDeleteFooter from './BulkDeleteFooter'
import BulkDeleteSummary from './BulkDeleteSummary'
import BulkActionsInfo from '../BulkActionsInfo'

export interface Props {
  onCancel: () => void
}

const BulkDelete = (props: Props) => {
  const { onCancel } = props
  const { filter, search, loading } = useSelector(bulkActionsDeleteSelector)
  const {
    status,
    filter: { match, type: filterType },
    progress,
    error,
  } = useSelector(bulkActionsDeleteOverviewSelector) ?? { filter: {} }

  const hasSearchOrFilter = !!search || filter !== null

  const [showPlaceholder, setShowPlaceholder] =
    useState<boolean>(!hasSearchOrFilter)

  useEffect(() => {
    setShowPlaceholder(!status && !hasSearchOrFilter)
  }, [status, hasSearchOrFilter])

  const searchPattern = match || search || '*'

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
            error={error}
          >
            <Col gap="l">
              <BulkDeleteSummary />
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
