import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  InstanceRedisCloud,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'
import { cloudSelector } from 'uiSrc/slices/instances/cloud'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { Flex, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
} from 'uiSrc/components/base/forms'
import { SearchInput } from 'uiSrc/components/base/inputs'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'
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
    <Text className={styles.subTitle}>
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
          Redis Enterprise Databases Added
        </Title>
        <Flex align="end" gap="s">
          <FlexItem grow>
            <MessageBar opened={!!countSuccessAdded || !!countFailAdded}>
              <SummaryText />
            </MessageBar>
          </FlexItem>
          <FlexItem>
            <RiFormField className={styles.searchForm}>
              <SearchInput
                placeholder="Search..."
                onChange={onQueryChange}
                aria-label="Search"
                data-testid="search"
              />
            </RiFormField>
          </FlexItem>
        </Flex>
        <br />
        <div className="itemList databaseList cloudDatabaseListResult">
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
          {!items.length && <Text>{message}</Text>}
        </div>
      </div>
      <FlexItem padding={4}>
        <Row justify="between">
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
        </Row>
      </FlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisCloudDatabaseListResult
