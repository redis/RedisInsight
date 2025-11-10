import React, { useEffect, useState } from 'react'
import { map } from 'lodash'
import {
  InstanceRedisCloud,
  RedisCloudAccount,
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
} from 'uiSrc/slices/interfaces'
import { Maybe, Nullable } from 'uiSrc/utils'
import { LoadingContent, Spacer } from 'uiSrc/components/base/layout'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import validationErrors from 'uiSrc/constants/validationErrors'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'
import {
  ColumnDef,
  RowSelectionState,
  Table,
} from 'uiSrc/components/base/layout/table'

import { Col, Row } from 'uiSrc/components/base/layout/flex'
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import styles from '../styles.module.scss'
import {
  AccountItem,
  AccountItemTitle,
  AccountWrapper,
} from './RedisCloudSubscriptions.styles'
import {
  DatabaseContainer,
  DatabaseWrapper,
  Footer,
  Header,
} from 'uiSrc/components/auto-discover'
import { canSelectRow } from 'uiSrc/pages/autodiscover-cloud/redis-cloud-subscriptions/useCloudSubscriptionConfig'

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

interface IPopoverProps {
  isPopoverOpen: boolean
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'
const noResultsMessage = 'Your Redis Cloud has no subscriptions available.'

const Account = ({ account }: { account: RedisCloudAccount }) => (
  <AccountWrapper>
    <AccountItem>
      <AccountItemTitle>Account ID:</AccountItemTitle>
      <AccountValue data-testid="account-id" value={account?.accountId} />
    </AccountItem>
    <AccountItem>
      <AccountItemTitle>Name:</AccountItemTitle>
      <AccountValue data-testid="account-name" value={account?.accountName} />
    </AccountItem>
    <AccountItem>
      <AccountItemTitle>Owner Name:</AccountItemTitle>
      <AccountValue
        data-testid="account-owner-name"
        value={account?.ownerName}
      />
    </AccountItem>
    <AccountItem>
      <AccountItemTitle>Owner Email:</AccountItemTitle>
      <AccountValue
        data-testid="account-owner-email"
        value={account?.ownerEmail}
      />
    </AccountItem>
  </AccountWrapper>
)

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
  const [rowSelection, setRowSelection] = useState<
    Record<NonNullable<RedisCloudSubscription['id']>, boolean>
  >({})

  useEffect(() => {
    if (!selection) return
    setRowSelection(
      selection.reduce(
        (acc, item) => {
          if (item.id) {
            acc[item.id] = true
          }
          return acc
        },
        {} as Record<NonNullable<RedisCloudSubscription['id']>, boolean>,
      ),
    )
  }, [selection])

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

  const CancelButton = ({ isPopoverOpen: popoverIsOpen }: IPopoverProps) => (
    <RiPopover
      anchorPosition="upCenter"
      isOpen={popoverIsOpen}
      closePopover={closePopover}
      panelClassName={styles.panelCancelBtn}
      panelPaddingSize="l"
      button={
        <SecondaryButton
          onClick={showPopover}
          className="btn-cancel"
          data-testid="btn-cancel"
        >
          Cancel
        </SecondaryButton>
      }
    >
      <Text size="m">
        Your changes have not been saved.&#10;&#13; Do you want to proceed to
        the list of databases?
      </Text>
      <br />
      <div>
        <DestructiveButton
          size="s"
          onClick={onClose}
          data-testid="btn-cancel-proceed"
        >
          Proceed
        </DestructiveButton>
      </div>
    </RiPopover>
  )

  const SubmitButton = ({ isDisabled }: { isDisabled: boolean }) => (
    <RiTooltip
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      title={
        isDisabled ? validationErrors.SELECT_AT_LEAST_ONE('subscription') : null
      }
      content={
        isDisabled ? (
          <span>{validationErrors.NO_SUBSCRIPTIONS_CLOUD}</span>
        ) : null
      }
    >
      <PrimaryButton
        size="m"
        disabled={isDisabled}
        onClick={handleSubmit}
        loading={loading}
        data-testid="btn-show-databases"
      >
        Show databases
      </PrimaryButton>
    </RiTooltip>
  )

  const SummaryText = () => (
    <Text size="M">
      <ColorText variant="semiBold">Summary: </ColorText>
      {countStatusActive ? (
        <span>
          Successfully discovered database(s) in {countStatusActive}
          &nbsp;
          {countStatusActive > 1 ? 'subscriptions' : 'subscription'}
          .&nbsp;
        </span>
      ) : null}

      {countStatusFailed ? (
        <span>
          Failed to discover database(s) in {countStatusFailed}
          &nbsp;
          {countStatusFailed > 1 ? 'subscriptions.' : ' subscription.'}
        </span>
      ) : null}
    </Text>
  )

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
          {account && <Account account={account} />}
          <Spacer size="m" />
          <Table
            rowSelectionMode="multiple"
            getRowCanSelect={canSelectRow}
            rowSelection={rowSelection}
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
            pageSizes={[5, 10, 25, 50, 100]}
          />
          {!items.length && (
            <Col centered full>
              <Text size="L">{message}</Text>
            </Col>
          )}
        </DatabaseWrapper>
        <MessageBar opened={countStatusActive + countStatusFailed > 0}>
          <SummaryText />
        </MessageBar>
      </DatabaseContainer>

      <Footer>
        <Row justify="end">
          <Row gap="m" grow={false}>
            <CancelButton isPopoverOpen={isPopoverOpen} />
            <SubmitButton isDisabled={(selection?.length || 0) < 1} />
          </Row>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

const AccountValue = ({
  value,
  ...rest
}: {
  value?: Nullable<string | number>
}) => {
  if (!value) {
    return (
      <div style={{ width: 80, height: 15 }}>
        <LoadingContent lines={1} />
      </div>
    )
  }
  return (
    <ColorText color="primary" size="M" {...rest}>
      {value}
    </ColorText>
  )
}

export default RedisCloudSubscriptions
