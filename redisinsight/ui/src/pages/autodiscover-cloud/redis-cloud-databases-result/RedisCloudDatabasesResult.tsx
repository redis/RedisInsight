import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  InstanceRedisCloud,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'
import { cloudSelector } from 'uiSrc/slices/instances/cloud'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import {
  RiFlexGroup as Flex,
  RiFlexItem,
  RiRow,
  RiTable,
  ColumnDefinition,
} from 'uiSrc/components/base/layout'
import {
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
} from 'uiSrc/components/base/forms'
import { RiSearchInput } from 'uiSrc/components/base/inputs'
import { RiTitle } from 'uiSrc/components/base/text/RiTitle'
import { RiText } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'

export interface Props {
  columns: ColumnDefinition<InstanceRedisCloud>[]
  onView: () => void
  onBack: () => void
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'

const RedisCloudDatabaseListResult = ({ columns, onBack, onView }: Props) => {
  const [items, setItems] = useState<InstanceRedisCloud[]>([])
  const [message, setMessage] = useState(loadingMsg)

  const { dataAdded: instances } = useSelector(cloudSelector)

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
        item.publicEndpoint?.toLowerCase().indexOf(value) !== -1 ||
        item.subscriptionId?.toString()?.indexOf(value) !== -1 ||
        item.subscriptionName?.toLowerCase().indexOf(value) !== -1 ||
        item.databaseId?.toString()?.indexOf(value) !== -1,
    )

    if (!itemsTemp.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  const SummaryText = () => (
    <RiText className={styles.subTitle}>
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
          Redis Enterprise Databases Added
        </RiTitle>
        <Flex align="end" gap="s">
          <RiFlexItem grow>
            <MessageBar opened={!!countSuccessAdded || !!countFailAdded}>
              <SummaryText />
            </MessageBar>
          </RiFlexItem>
          <RiFlexItem>
            <RiFormField className={styles.searchForm}>
              <RiSearchInput
                placeholder="Search..."
                onChange={onQueryChange}
                aria-label="Search"
                data-testid="search"
              />
            </RiFormField>
          </RiFlexItem>
        </Flex>
        <br />
        <div className="itemList databaseList cloudDatabaseListResult">
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
          {!items.length && <RiText>{message}</RiText>}
        </div>
      </div>
      <RiFlexItem padding={4}>
        <RiRow justify="between">
          <RiSecondaryButton
            onClick={onBack}
            className="btn-cancel btn-back"
            data-testid="btn-back-to-adding"
          >
            Back to adding databases
          </RiSecondaryButton>
          <RiPrimaryButton onClick={onView} data-testid="btn-view-databases">
            View Databases
          </RiPrimaryButton>
        </RiRow>
      </RiFlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisCloudDatabaseListResult
