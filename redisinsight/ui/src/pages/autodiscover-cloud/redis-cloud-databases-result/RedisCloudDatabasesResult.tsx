import React, { useEffect, useState } from 'react'
import type { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { riToast } from 'uiSrc/components/base/display/toast'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { Row } from 'uiSrc/components/base/layout/flex'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import { Table } from 'uiSrc/components/base/layout/table'
import { Spacer } from 'uiSrc/components/base/layout'
import {
  DatabaseContainer,
  DatabaseWrapper,
  EmptyState,
  Footer,
  Header,
} from 'uiSrc/components/auto-discover'
import { SummaryText } from './components'

export interface Props {
  instances: InstanceRedisCloud[]
  columns: ColumnDef<InstanceRedisCloud>[]
  onView: () => void
  onBack: () => void
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'

const RedisCloudDatabaseListResult = ({
  instances,
  columns,
  onBack,
  onView,
}: Props) => {
  const [items, setItems] = useState<InstanceRedisCloud[]>([])
  const [message, setMessage] = useState(loadingMsg)

  useEffect(() => setItems(instances), [instances])

  const countSuccessAdded = instances.filter(
    ({ statusAdded }) => statusAdded === AddRedisDatabaseStatus.Success,
  )?.length

  const countFailAdded = instances.filter(
    ({ statusAdded }) => statusAdded === AddRedisDatabaseStatus.Fail,
  )?.length

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()

    const itemsTemp = instances.filter(
      (item: InstanceRedisCloud) =>
        item.name?.toLowerCase().indexOf(value) !== -1 ||
        (item.publicEndpoint || '')?.toLowerCase().indexOf(value) !== -1 ||
        item.subscriptionId?.toString()?.indexOf(value) !== -1 ||
        item.subscriptionName?.toLowerCase().indexOf(value) !== -1 ||
        item.databaseId?.toString()?.indexOf(value) !== -1,
    )

    if (!itemsTemp.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  return (
    <AutodiscoveryPageTemplate>
      <DatabaseContainer>
        <Header
          title="Redis Enterprise Databases Added"
          onBack={onBack}
          onQueryChange={onQueryChange}
        />
        <Spacer size="m" />
        <DatabaseWrapper>
          <Table
            columns={columns}
            data={items}
            defaultSorting={[
              {
                id: 'name',
                desc: false,
              },
            ]}
            paginationEnabled={items.length > 10}
            stripedRows
            emptyState={() => <EmptyState message={message} />}
          />
        </DatabaseWrapper>
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
      </DatabaseContainer>
      <Footer>
        <Row justify="end">
          <PrimaryButton
            onClick={onView}
            data-testid="btn-view-databases"
            disabled={items.length === 0}
          >
            View Databases
          </PrimaryButton>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisCloudDatabaseListResult
