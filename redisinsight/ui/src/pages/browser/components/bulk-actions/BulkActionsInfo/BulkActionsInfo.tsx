import React from 'react'

import { Maybe, Nullable } from 'uiSrc/utils'
import Divider from 'uiSrc/components/divider/Divider'
import { BulkActionsStatus, KeyTypes } from 'uiSrc/constants'
import GroupBadge from 'uiSrc/components/group-badge/GroupBadge'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import {
  BulkActionsContainer,
  BulkActionsInfoFilter,
  BulkActionsInfoSearch,
  BulkActionsProgressLine,
  BulkActionsStatusDisplay,
  BulkActionsTitle,
} from './BulkActionsInfo.styles'

export interface Props {
  title?: string | React.ReactNode
  subTitle?: string | React.ReactNode
  loading: boolean
  filter?: Nullable<KeyTypes>
  status: Maybe<BulkActionsStatus>
  search?: string
  progress?: {
    total: Maybe<number>
    scanned: Maybe<number>
  }
  children?: React.ReactNode
}

const BulkActionsInfo = (props: Props) => {
  const {
    children,
    loading,
    filter,
    search,
    status,
    progress,
    title = 'Delete Keys with',
    subTitle,
  } = props
  const { total = 0, scanned = 0 } = progress || {}

  return (
    <BulkActionsContainer data-testid="bulk-actions-info">
      <BulkActionsStatusDisplay
        status={status}
        total={total}
        scanned={scanned}
      />
      <Col gap="m">
        <BulkActionsTitle color="subdued" $full>
          {title}
        </BulkActionsTitle>
        {subTitle && (
          <BulkActionsTitle color="subdued" $full>
            {subTitle}
          </BulkActionsTitle>
        )}
        <Row justify="start" align="center" gap="s">
          {filter && (
            <BulkActionsInfoFilter data-testid="bulk-actions-info-filter">
              <div>Key type:</div>
              <GroupBadge type={filter} />
            </BulkActionsInfoFilter>
          )}
          {search && (
            <BulkActionsInfoFilter data-testid="bulk-actions-info-search">
              Pattern:
              <BulkActionsInfoSearch color="subdued">
                {' '}
                {search}
              </BulkActionsInfoSearch>
            </BulkActionsInfoFilter>
          )}
        </Row>
      </Col>
      <Divider colorVariable="separatorColor" />
      {loading && (
        <BulkActionsProgressLine data-testid="progress-line">
          <div style={{ width: `${(total ? scanned / total : 0) * 100}%` }} />
        </BulkActionsProgressLine>
      )}
      <div>{children}</div>
    </BulkActionsContainer>
  )
}

export default BulkActionsInfo
