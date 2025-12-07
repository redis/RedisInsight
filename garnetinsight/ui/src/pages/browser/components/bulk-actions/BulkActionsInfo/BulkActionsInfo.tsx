import React from 'react'

import { Maybe, Nullable } from 'uiSrc/utils'
import Divider from 'uiSrc/components/divider/Divider'
import { BulkActionsStatus, KeyTypes, RedisDataType } from 'uiSrc/constants'
import GroupBadge from 'uiSrc/components/group-badge/GroupBadge'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

import BulkActionsStatusDisplay from '../BulkActionsStatusDisplay'
import {
  BulkActionsContainer,
  BulkActionsInfoFilter,
  BulkActionsInfoSearch,
  BulkActionsProgressLine,
  BulkActionsTitle,
} from './BulkActionsInfo.styles'

export interface Props {
  title?: string | React.ReactNode
  subTitle?: string | React.ReactNode
  loading: boolean
  filter?: Nullable<KeyTypes> | RedisDataType
  status: Maybe<BulkActionsStatus>
  search?: string
  progress?: {
    total: Maybe<number>
    scanned: Maybe<number>
  }
  children?: React.ReactNode
  error?: string
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
    error,
  } = props
  const { total = 0, scanned = 0 } = progress || {}

  return (
    <BulkActionsContainer data-testid="bulk-actions-info">
      <BulkActionsStatusDisplay
        status={status}
        total={total}
        scanned={scanned}
        error={error}
      />
      <Col justify="between" gap="xxl">
        <BulkActionsTitle color="primary" $full>
          {title}
        </BulkActionsTitle>
        {subTitle && (
          <BulkActionsTitle color="primary" $full>
            {subTitle}
          </BulkActionsTitle>
        )}
        {(filter || search) && (
          <Row justify="start" align="center" gap="xxl">
            {filter && (
              <BulkActionsInfoFilter data-testid="bulk-actions-info-filter">
                <Text size="s" color="primary">
                  Key type:
                </Text>
                <GroupBadge type={filter} />
              </BulkActionsInfoFilter>
            )}
            {search && (
              <BulkActionsInfoFilter data-testid="bulk-actions-info-search">
                <Text size="s" color="primary">
                  Pattern:
                </Text>
                <BulkActionsInfoSearch color="primary">
                  {' '}
                  {search}
                </BulkActionsInfoSearch>
              </BulkActionsInfoFilter>
            )}
          </Row>
        )}
      </Col>
      <Divider />
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
