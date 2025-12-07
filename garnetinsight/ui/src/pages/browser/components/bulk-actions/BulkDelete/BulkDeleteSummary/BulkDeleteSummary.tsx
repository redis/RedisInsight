import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { isUndefined } from 'lodash'

import { numberWithSpaces, nullableNumberWithSpaces } from 'uiSrc/utils/numbers'
import { keysDataSelector } from 'uiSrc/slices/browser/keys'
import { getApproximatePercentage } from 'uiSrc/utils/validations'
import {
  bulkActionsDeleteOverviewSelector,
  bulkActionsDeleteSummarySelector,
} from 'uiSrc/slices/browser/bulkActions'
import BulkActionSummary from 'uiSrc/pages/browser/components/bulk-actions/BulkActionSummary'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

const BulkDeleteSummary = () => {
  const [title, setTitle] = useState<string>('')
  const { scanned = 0, total = 0, keys } = useSelector(keysDataSelector)
  const { processed, succeed, failed } =
    useSelector(bulkActionsDeleteSummarySelector) ?? {}
  const { duration = 0, status } =
    useSelector(bulkActionsDeleteOverviewSelector) ?? {}

  useEffect(() => {
    if (scanned < total && !keys.length) {
      setTitle('Expected amount: N/A')
      return
    }

    const approximateCount =
      scanned < total ? (keys.length * total) / scanned : keys.length
    setTitle(
      `Expected amount: ${scanned < total ? '~' : ''}${nullableNumberWithSpaces(Math.round(approximateCount))} keys`,
    )
  }, [scanned, total, keys])

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
                  Expected amount is estimated based on the number of keys
                  scanned and the scan percentage. The final number may be
                  different.
                </Text>
              }
            >
              <RiIcon type="InfoIcon" data-testid="bulk-delete-tooltip" />
            </RiTooltip>
          </Row>
          <Text color="primary" size="S" data-testid="bulk-delete-summary">
            {`Scanned ${getApproximatePercentage(total, scanned)} `}
            {`(${numberWithSpaces(scanned)}/${nullableNumberWithSpaces(total)}) `}
            {`and found ${numberWithSpaces(keys.length)} keys`}
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
