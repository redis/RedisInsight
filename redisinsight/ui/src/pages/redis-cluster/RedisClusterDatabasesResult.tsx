import React, { useEffect, useState } from 'react'

import type { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'
import { setTitle } from 'uiSrc/utils'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { riToast } from 'uiSrc/components/base/display/toast'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'
import { useTranslation } from 'uiSrc/i18n'

import { Row } from 'uiSrc/components/base/layout/flex'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { type ColumnDef, Table } from 'uiSrc/components/base/layout/table'
import {
  DatabaseContainer,
  DatabaseWrapper,
  EmptyState,
  Footer,
  Header,
} from 'uiSrc/components/auto-discover'
import { Spacer } from 'uiSrc/components/base/layout'
import { SummaryText } from './components'

export interface Props {
  columns: ColumnDef<InstanceRedisCluster>[]
  instances: InstanceRedisCluster[]
  onView: (sendEvent?: boolean) => void
  onBack: (sendEvent?: boolean) => void
}

const RedisClusterDatabasesResult = ({
  columns,
  instances,
  onBack,
  onView,
}: Props) => {
  const { t } = useTranslation()
  const [items, setItems] = useState<InstanceRedisCluster[]>([])
  const [message, setMessage] = useState(t('cluster.loadingMsg'))

  useEffect(() => {
    setTitle(t('cluster.result.pageTitle'))
  }, [])

  useEffect(() => {
    setItems(instances)
  }, [instances])

  const countSuccessAdded = instances.filter(
    ({ statusAdded }) => statusAdded === AddRedisDatabaseStatus.Success,
  )?.length

  const countFailAdded = instances.filter(
    ({ statusAdded }) => statusAdded === AddRedisDatabaseStatus.Fail,
  )?.length

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()
    const itemsTemp = instances.filter(
      (item: InstanceRedisCluster) =>
        item.name?.toLowerCase().indexOf(value) !== -1 ||
        item.dnsName?.toLowerCase().indexOf(value) !== -1 ||
        item.port?.toString().indexOf(value) !== -1,
    )

    if (!itemsTemp.length) {
      setMessage(t('cluster.notFound'))
    }
    setItems(itemsTemp)
  }

  return (
    <AutodiscoveryPageTemplate>
      <DatabaseContainer justify="start">
        <Header
          title={t('cluster.result.title', {
            count: countSuccessAdded + countFailAdded,
          })}
          onBack={onBack}
          onQueryChange={onQueryChange}
        />
        <MessageBar
          opened={!!countSuccessAdded || !!countFailAdded}
          variant={
            !!countFailAdded
              ? riToast.Variant.Attention
              : riToast.Variant.Success
          }
        >
          <SummaryText
            countSuccessAdded={countSuccessAdded}
            countFailAdded={countFailAdded}
          />
        </MessageBar>
        <Spacer size="m" />
        <DatabaseWrapper>
          <Table
            columns={columns}
            data={items}
            defaultSorting={[{ id: 'name', desc: false }]}
            paginationEnabled={items.length > 10}
            stripedRows
            emptyState={() => <EmptyState message={message} />}
          />
        </DatabaseWrapper>
      </DatabaseContainer>
      <Footer>
        <Row justify="end">
          <PrimaryButton
            size="m"
            onClick={() => onView(false)}
            data-testid="btn-view-databases"
          >
            {t('cluster.result.viewButton')}
          </PrimaryButton>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisClusterDatabasesResult
