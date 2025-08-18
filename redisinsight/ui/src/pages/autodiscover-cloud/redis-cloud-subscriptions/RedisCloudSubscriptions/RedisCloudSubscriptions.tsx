import React, { useState, useEffect } from 'react'
import { map } from 'lodash'
import cx from 'classnames'
import {
  RiLoadingContent,
  RiTable,
  ColumnDefinition,
  RiFlexItem,
  RiRow,
} from 'uiBase/layout'

import {
  RiDestructiveButton,
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
} from 'uiBase/forms'
import { InfoIcon } from 'uiBase/icons'
import { RiSearchInput } from 'uiBase/inputs'
import { RiTitle, RiText } from 'uiBase/text'
import { RiPopover, RiTooltip } from 'uiBase/display'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'
import validationErrors from 'uiSrc/constants/validationErrors'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { Maybe, Nullable } from 'uiSrc/utils'
import {
  InstanceRedisCloud,
  RedisCloudAccount,
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
} from 'uiSrc/slices/interfaces'
import styles from '../styles.module.scss'

export interface Props {
  columns: ColumnDefinition<RedisCloudSubscription>[]
  subscriptions: Nullable<RedisCloudSubscription[]>
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
}

interface IPopoverProps {
  isPopoverOpen: boolean
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'
const noResultsMessage = 'Your Redis Cloud has no subscriptions available.'

const RedisCloudSubscriptions = ({
  subscriptions,
  columns,
  loading,
  account = null,
  onClose,
  onBack,
  onSubmit,
}: Props) => {
  // const subscriptions = [];
  const [items, setItems] = useState(subscriptions || [])
  const [message, setMessage] = useState(loadingMsg)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const [selection, setSelection] = useState<RedisCloudSubscription[]>([])

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

  const selectionValue = {
    onSelectionChange: (selected: RedisCloudSubscription) =>
      setSelection((previous) => {
        const canSelect =
          selected.status === RedisCloudSubscriptionStatus.Active &&
          selected.numberOfDatabases !== 0

        if (!canSelect) {
          return previous
        }

        const isSelected = previous.some(
          (item) => item.id === selected.id && item.type === selected.type,
        )
        if (isSelected) {
          return previous.filter(
            (item) => !(item.id === selected.id && item.type === selected.type),
          )
        }
        return [...previous, selected]
      }),
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
        <RiSecondaryButton
          onClick={showPopover}
          className="btn-cancel"
          data-testid="btn-cancel"
        >
          Cancel
        </RiSecondaryButton>
      }
    >
      <RiText size="m">
        Your changes have not been saved.&#10;&#13; Do you want to proceed to
        the list of databases?
      </RiText>
      <br />
      <div>
        <RiDestructiveButton
          size="s"
          onClick={onClose}
          data-testid="btn-cancel-proceed"
        >
          Proceed
        </RiDestructiveButton>
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
      <RiPrimaryButton
        size="m"
        disabled={isDisabled}
        onClick={handleSubmit}
        loading={loading}
        icon={isDisabled ? InfoIcon : undefined}
        data-testid="btn-show-databases"
      >
        Show databases
      </RiPrimaryButton>
    </RiTooltip>
  )

  const SummaryText = () => (
    <RiText className={styles.subTitle}>
      <b>Summary: </b>
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
    </RiText>
  )

  const Account = () => (
    <>
      <span className={styles.account_item}>
        <span className={styles.account_item_title}>Account ID:&nbsp;</span>
        <span color="subdued" data-testid="account-id">
          {account?.accountId ?? <RiLoadingContent lines={1} />}
        </span>
      </span>
      <span className={styles.account_item}>
        <span className={styles.account_item_title}>Name:&nbsp;</span>
        <span color="subdued" data-testid="account-name">
          {account?.accountName ?? <RiLoadingContent lines={1} />}
        </span>
      </span>
      <span className={styles.account_item}>
        <span className={styles.account_item_title}>Owner Name:&nbsp;</span>
        <span color="subdued" data-testid="account-owner-name">
          {account?.ownerName ?? <RiLoadingContent lines={1} />}
        </span>
      </span>
      <span className={styles.account_item}>
        <span className={styles.account_item_title}>Owner Email:&nbsp;</span>
        <span color="subdued" data-testid="account-owner-email">
          {account?.ownerEmail ?? <RiLoadingContent lines={1} />}
        </span>
      </span>
    </>
  )

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <RiTitle size="XXL" className={styles.title} data-testid="title">
          Redis Cloud Subscriptions
        </RiTitle>

        <RiRow align="end" gap="s">
          <RiFlexItem grow>
            <MessageBar opened={countStatusActive + countStatusFailed > 0}>
              <SummaryText />
            </MessageBar>
          </RiFlexItem>
          <RiFlexItem>
            <RiFormField className={styles.searchForm}>
              <RiSearchInput
                placeholder="Search..."
                className={styles.search}
                onChange={onQueryChange}
                aria-label="Search"
                data-testid="search"
              />
            </RiFormField>
          </RiFlexItem>
        </RiRow>
        <br />

        <div
          className={cx('databaseList', 'itemList', styles.cloudSubscriptions)}
        >
          <div className={styles.account}>
            <Account />
          </div>
          <RiTable
            columns={columns}
            data={items}
            defaultSorting={[
              {
                id: 'name',
                desc: false,
              },
            ]}
            onRowClick={selectionValue.onSelectionChange}
          />
          {!items.length && (
            <RiText className={styles.noSubscriptions}>{message}</RiText>
          )}
        </div>
      </div>
      <RiFlexItem padding={4}>
        <RiRow gap="m" justify="between">
          <RiSecondaryButton
            onClick={onBack}
            className="btn-cancel btn-back"
            data-testid="btn-back-adding"
          >
            Back to adding databases
          </RiSecondaryButton>
          <RiFlexItem direction="row">
            <CancelButton isPopoverOpen={isPopoverOpen} />
            <SubmitButton isDisabled={selection.length < 1} />
          </RiFlexItem>
        </RiRow>
      </RiFlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisCloudSubscriptions
