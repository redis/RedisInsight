import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'

import {
  AddRedisDatabaseStatus,
  InstanceRedisCluster,
} from 'uiSrc/slices/interfaces'
import { setTitle } from 'uiSrc/utils'
import { clusterSelector } from 'uiSrc/slices/instances/cluster'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
} from 'uiSrc/components/base/forms'
import { RiSearchInput } from 'uiSrc/components/base/inputs'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'
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
    <Text>
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
    </Text>
  )

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <Title size="XXL" className={styles.title} data-testid="title">
          Redis Enterprise
          {countSuccessAdded + countFailAdded > 1
            ? ' Databases '
            : ' Database '}
          Added
        </Title>
        <Row align="end" gap="s">
          <FlexItem grow>
            <MessageBar opened={!!countSuccessAdded || !!countFailAdded}>
              <SummaryText />
            </MessageBar>
          </FlexItem>
          <FlexItem>
            <RiFormField className={styles.searchForm}>
              <RiSearchInput
                placeholder="Search..."
                className={styles.search}
                onChange={onQueryChange}
                aria-label="Search"
                data-testid="search"
              />
            </RiFormField>
          </FlexItem>
        </Row>
        <br />
        <div className="itemList databaseList clusterDatabaseListResult">
          <Table
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
            <Text className={styles.noDatabases}>{message}</Text>
          )}
        </div>
      </div>
      <FlexItem className={cx(styles.footer, 'footerAddDatabase')}>
        <Row justify="between">
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
        </Row>
      </FlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisClusterDatabasesResult
