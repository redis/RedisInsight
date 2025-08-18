import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'

import { RiFlexItem, RiRow, RiTable, ColumnDefinition } from 'uiBase/layout'
import { RiPrimaryButton, RiSecondaryButton, RiFormField } from 'uiBase/forms'
import { RiSearchInput } from 'uiBase/inputs'
import { RiTitle, RiText } from 'uiBase/text'
import {
  AddRedisDatabaseStatus,
  InstanceRedisCluster,
} from 'uiSrc/slices/interfaces'
import { setTitle } from 'uiSrc/utils'
import { clusterSelector } from 'uiSrc/slices/instances/cluster'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import styles from './styles.module.scss'

export interface Props {
  columns: ColumnDefinition<InstanceRedisCluster>[]
  onView: (sendEvent?: boolean) => void
  onBack: (sendEvent?: boolean) => void
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'

const RedisClusterDatabasesResult = ({ columns, onBack, onView }: Props) => {
  const [items, setItems] = useState<InstanceRedisCluster[]>([])
  const [message, setMessage] = useState(loadingMsg)

  const { dataAdded: instances } = useSelector(clusterSelector)

  setTitle('Redis Enterprise Databases Added')

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
      (item: InstanceRedisCluster) =>
        item.name?.toLowerCase().indexOf(value) !== -1 ||
        item.dnsName?.toLowerCase().indexOf(value) !== -1 ||
        item.port?.toString().indexOf(value) !== -1,
    )

    if (!itemsTemp.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  const SummaryText = () => (
    <RiText>
      <b>Summary: </b>
      {countSuccessAdded ? (
        <span>
          Successfully added {countSuccessAdded} database(s)
          {countFailAdded ? '. ' : '.'}
        </span>
      ) : null}
      {countFailAdded ? (
        <span>Failed to add {countFailAdded} database(s).</span>
      ) : null}
    </RiText>
  )

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <RiTitle size="XXL" className={styles.title} data-testid="title">
          Redis Enterprise
          {countSuccessAdded + countFailAdded > 1
            ? ' Databases '
            : ' Database '}
          Added
        </RiTitle>
        <RiRow align="end" gap="s">
          <RiFlexItem grow>
            <MessageBar opened={!!countSuccessAdded || !!countFailAdded}>
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
        <div className="itemList databaseList clusterDatabaseListResult">
          <RiTable
            columns={columns}
            data={items}
            defaultSorting={[
              {
                id: 'name',
                desc: false,
              },
            ]}
          />
          {!items.length && (
            <RiText className={styles.noDatabases}>{message}</RiText>
          )}
        </div>
      </div>
      <RiFlexItem className={cx(styles.footer, 'footerAddDatabase')}>
        <RiRow justify="between">
          <RiSecondaryButton
            onClick={() => onBack(false)}
            className="btn-cancel btn-back"
            data-testid="btn-back-to-adding"
          >
            Back to adding databases
          </RiSecondaryButton>
          <RiPrimaryButton
            size="m"
            onClick={() => onView(false)}
            data-testid="btn-view-databases"
          >
            View Databases
          </RiPrimaryButton>
        </RiRow>
      </RiFlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisClusterDatabasesResult
