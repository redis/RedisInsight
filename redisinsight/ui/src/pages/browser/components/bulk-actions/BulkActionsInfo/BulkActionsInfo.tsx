import React from 'react'

import { Maybe, Nullable } from 'uiSrc/utils'
import Divider from 'uiSrc/components/divider/Divider'
import { BulkActionsStatus, KeyTypes, RedisDataType } from 'uiSrc/constants'
import GroupBadge from 'uiSrc/components/group-badge/GroupBadge'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { useTranslation } from 'uiSrc/i18n'

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
  const { t } = useTranslation()
  const {
    children,
    loading,
    filter,
    search,
    status,
    progress,
    title = t('browser.bulkActions.info.title'),
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
                  {t('browser.bulkActions.info.keyType')}
                </Text>
                <GroupBadge type={filter} />
              </BulkActionsInfoFilter>
            )}
            {search && (
              <BulkActionsInfoFilter data-testid="bulk-actions-info-search">
                <Text size="s" color="primary">
                  {t('browser.bulkActions.info.pattern')}
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
