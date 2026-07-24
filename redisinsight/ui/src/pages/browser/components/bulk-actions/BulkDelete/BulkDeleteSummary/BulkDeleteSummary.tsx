import React, { useEffect, useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { isUndefined } from 'lodash'

import { numberWithSpaces, nullableNumberWithSpaces } from 'uiSrc/utils/numbers'
import { keysDataSelector } from 'uiSrc/slices/browser/keys'
import { getApproximatePercentage } from 'uiSrc/utils/validations'
import {
  bulkActionsDeleteOverviewSelector,
  bulkActionsDeleteSelector,
  bulkActionsDeleteSummarySelector,
} from 'uiSrc/slices/browser/bulkActions'
import BulkActionSummary from 'uiSrc/pages/browser/components/bulk-actions/BulkActionSummary'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { useTranslation } from 'uiSrc/i18n'

import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

const BulkDeleteSummary = () => {
  const { t } = useTranslation()
  const [title, setTitle] = useState<string>('')
  const { scanned = 0, total = 0, keys } = useAppSelector(keysDataSelector)
  const { keyCount } = useAppSelector(bulkActionsDeleteSelector)
  const { processed, succeed, failed } =
    useAppSelector(bulkActionsDeleteSummarySelector) ?? {}
  const { duration = 0, status } =
    useAppSelector(bulkActionsDeleteOverviewSelector) ?? {}

  // Check if this is a folder delete (keyCount is set)
  const isFolderDelete = keyCount !== null && keyCount !== undefined

  useEffect(() => {
    // If no keys have been scanned yet, can't calculate approximation (avoid division by zero)
    if (scanned === 0) {
      setTitle(t('browser.bulkActions.delete.expectedAmountNa'))
      return
    }

    // If keyCount is set (folder delete), calculate approximate based on scan progress
    if (isFolderDelete) {
      const approximateCount =
        scanned < total ? (keyCount * total) / scanned : keyCount
      setTitle(
        t('browser.bulkActions.delete.expectedAmount', {
          amount: `${scanned < total ? '~' : ''}${nullableNumberWithSpaces(Math.round(approximateCount))}`,
        }),
      )
      return
    }

    // Otherwise, calculate from scanned keys (normal bulk delete)
    if (scanned < total && !keys.length) {
      setTitle(t('browser.bulkActions.delete.expectedAmountNa'))
      return
    }

    const approximateCount =
      scanned < total ? (keys.length * total) / scanned : keys.length
    setTitle(
      t('browser.bulkActions.delete.expectedAmount', {
        amount: `${scanned < total ? '~' : ''}${nullableNumberWithSpaces(Math.round(approximateCount))}`,
      }),
    )
  }, [scanned, total, keys, keyCount, isFolderDelete, t])

  // For folder delete: use folder's key count for "found"
  // For normal bulk delete: use browser scan progress and found keys count
  const displayFound = isFolderDelete ? keyCount : keys.length

  return (
    <div>
      {isUndefined(status) && (
        <Col gap="l">
          <Row gap="s">
            <Text color="primary" size="m" variant="semiBold">
              {title}
            </Text>
            <RiTooltip
              position="right"
              content={
                <Text size="XS">
                  {t('browser.bulkActions.delete.expectedAmountTooltip')}
                </Text>
              }
            >
              <RiIcon type="InfoIcon" data-testid="bulk-delete-tooltip" />
            </RiTooltip>
          </Row>
          <Text color="primary" size="S" data-testid="bulk-delete-summary">
            {t('browser.bulkActions.delete.scanned', {
              percentage: getApproximatePercentage(total, scanned),
              scanned: numberWithSpaces(scanned),
              total: nullableNumberWithSpaces(total),
              found: numberWithSpaces(displayFound),
            })}
          </Text>
        </Col>
      )}
      {!isUndefined(status) && (
        <BulkActionSummary
          succeed={succeed}
          processed={processed}
          failed={failed}
          duration={duration}
          data-testid="bulk-delete-completed-summary"
        />
      )}
    </div>
  )
}

export default BulkDeleteSummary
