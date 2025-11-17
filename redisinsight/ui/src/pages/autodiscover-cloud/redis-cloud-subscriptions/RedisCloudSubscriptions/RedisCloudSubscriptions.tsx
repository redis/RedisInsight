import React, { useEffect, useState } from 'react'
import { map } from 'lodash'
import {
  type InstanceRedisCloud,
  type RedisCloudAccount,
  type RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
} from 'uiSrc/slices/interfaces'
import { type Maybe, type Nullable } from 'uiSrc/utils'
import { Spacer } from 'uiSrc/components/base/layout'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { riToast } from 'uiSrc/components/base/display/toast'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'
import {
  type ColumnDef,
  type RowSelectionState,
  Table,
} from 'uiSrc/components/base/layout/table'

import { Row } from 'uiSrc/components/base/layout/flex'
import {
  DatabaseContainer,
  DatabaseWrapper,
  EmptyState,
  Footer,
  Header,
} from 'uiSrc/components/auto-discover'
import { canSelectRow } from '../utils/canSelectRow'
import { Account, CancelButton, SubmitButton, SummaryText } from '../components'

export interface Props {
  columns: ColumnDef<RedisCloudSubscription>[]
  subscriptions: Nullable<RedisCloudSubscription[]>
  selection: Nullable<RedisCloudSubscription[]>
  loading: boolean
  account: Nullable<RedisCloudAccount>
  error: string
  onClose: () => void
  onBack: () => void
  onSubmit: (
    subscriptions: Maybe<
      Pick<InstanceRedisCloud, 'subscriptionId' | 'subscriptionType' | 'free'>
    >[],
  ) => void
  onSelectionChange: (state: RowSelectionState) => void
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'
const noResultsMessage = 'Your Redis Cloud has no subscriptions available.'

const RedisCloudSubscriptions = ({
  subscriptions,
  selection,
  columns,
  loading,
  account = null,
  onClose,
  onBack,
  onSubmit,
  onSelectionChange,
}: Props) => {
  // const subscriptions = [];
  const [items, setItems] = useState(subscriptions || [])
  const [message, setMessage] = useState(loadingMsg)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  useEffect(() => {
    if (subscriptions !== null) {
      setItems(subscriptions)
    }

    if (subscriptions?.length === 0 && !loading) {
      setMessage(noResultsMessage)
    }
  }, [subscriptions, loading])

  const countStatusActive = items.filter(
    ({ status, numberOfDatabases }: RedisCloudSubscription) =>
      status === RedisCloudSubscriptionStatus.Active && numberOfDatabases !== 0,
  )?.length

  const countStatusFailed = items.length - countStatusActive

  const handleSubmit = () => {
    onSubmit(
      map(selection, ({ id, type, free }) => ({
        subscriptionId: id,
        subscriptionType: type,
        free,
      })),
    )
  }

  const showPopover = () => {
    setIsPopoverOpen(true)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()
    const itemsTemp =
      subscriptions?.filter(
        (item: RedisCloudSubscription) =>
          item.name?.toLowerCase()?.indexOf(value) !== -1 ||
          item.id?.toString()?.toLowerCase().indexOf(value) !== -1,
      ) ?? []

    if (!itemsTemp?.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  return (
    <AutodiscoveryPageTemplate>
      <DatabaseContainer justify="start">
        <Header
          title="Redis Cloud Subscriptions"
          onBack={onBack}
          onQueryChange={onQueryChange}
        />
        <Spacer size="m" />
        <DatabaseWrapper>
          {account && (
            <>
              <Account account={account} />
              <Spacer size="m" />
            </>
          )}
          <Table
            rowSelectionMode="multiple"
            getRowCanSelect={canSelectRow}
            onRowSelectionChange={onSelectionChange}
            getRowId={(row) => `${row.id}`}
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
          opened={countStatusActive + countStatusFailed > 0}
          variant={
            !!countStatusFailed
              ? riToast.Variant.Attention
              : riToast.Variant.Success
          }
        >
          <SummaryText
            countStatusActive={countStatusActive}
            countStatusFailed={countStatusFailed}
          />
        </MessageBar>
      </DatabaseContainer>

      <Footer>
        <Row justify="end">
          <Row gap="m" grow={false}>
            <CancelButton
              isPopoverOpen={isPopoverOpen}
              onClose={onClose}
              onShowPopover={showPopover}
              onClosePopover={closePopover}
            />
            <SubmitButton
              isDisabled={(selection?.length || 0) < 1}
              loading={loading}
              onClick={handleSubmit}
            />
          </Row>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisCloudSubscriptions
