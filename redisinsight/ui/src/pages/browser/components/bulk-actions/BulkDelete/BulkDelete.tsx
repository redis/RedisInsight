import React, { useEffect, useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { isUndefined } from 'lodash'
import { Text } from 'uiSrc/components/base/text'
import {
  bulkActionsDeleteOverviewSelector,
  bulkActionsDeleteSelector,
} from 'uiSrc/slices/browser/bulkActions'
import { Col } from 'uiSrc/components/base/layout/flex'

import { useTranslation } from 'uiSrc/i18n'
import BulkDeleteFooter from './BulkDeleteFooter'
import BulkDeleteSummary from './BulkDeleteSummary'
import BulkActionsInfo from '../BulkActionsInfo'

export interface Props {
  onCancel: () => void
}

const BulkDelete = (props: Props) => {
  const { onCancel } = props
  const { t } = useTranslation()
  const { filter, search, loading } = useAppSelector(bulkActionsDeleteSelector)
  const {
    status,
    filter: { match, type: filterType },
    progress,
    error,
  } = useAppSelector(bulkActionsDeleteOverviewSelector) ?? { filter: {} }

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
            {t('browser.bulkActions.placeholder.title')}
          </Text>
          <Text color="secondary">
            {t('browser.bulkActions.placeholder.description')}
          </Text>
        </Col>
      )}
    </>
  )
}

export default BulkDelete
