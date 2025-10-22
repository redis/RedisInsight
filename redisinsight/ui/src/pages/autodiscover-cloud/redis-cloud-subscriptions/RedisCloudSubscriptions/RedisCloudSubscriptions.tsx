import React, { useState, useEffect } from 'react'
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
  Table,
  ColumnDef,
  RowSelectionState,
} from 'uiSrc/components/base/layout/table'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  DestructiveButton,
  EmptyButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { SearchInput } from 'uiSrc/components/base/inputs'
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
  PageTitle,
  SearchForm,
} from 'uiSrc/components/auto-discover'
import { canSelectRow } from 'uiSrc/pages/autodiscover-cloud/redis-cloud-subscriptions/useCloudSubscriptionConfig'
import { ArrowLeftIcon } from '@redis-ui/icons'

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

  const Account = () => (
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
  return (
    <AutodiscoveryPageTemplate>
      <DatabaseContainer justify="start">
        <Row align="center" justify="between" grow={false}>
          <Col align="start" justify="start">
            <EmptyButton
              icon={ArrowLeftIcon}
              onClick={onBack}
              className="btn-cancel btn-back"
              data-testid="btn-back-adding"
            >
              Add databases
            </EmptyButton>
            <Spacer size="s" />
            <PageTitle data-testid="title">Redis Cloud Subscriptions</PageTitle>
          </Col>
          <Row justify="end" gap="s" grow={false}>
            <FlexItem>
              <SearchForm>
                <SearchInput
                  placeholder="Search..."
                  className={styles.search}
                  onChange={onQueryChange}
                  aria-label="Search"
                  data-testid="search"
                />
              </SearchForm>
            </FlexItem>
          </Row>
        </Row>
        <Spacer size="m" />
        <DatabaseWrapper>
          <Account />
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
            <Text className={styles.noSubscriptions}>{message}</Text>
          )}
        </DatabaseWrapper>
        <MessageBar opened={countStatusActive + countStatusFailed > 0}>
          <SummaryText />
        </MessageBar>
      </DatabaseContainer>

      <Footer>
        <Row justify="end">
          <Row grow={false} gap="m">
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
