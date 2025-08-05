import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RiSearchInput } from 'uiSrc/components/base/inputs'

import { sentinelSelector } from 'uiSrc/slices/instances/sentinel'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import {
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
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'

export interface Props {
  countSuccessAdded: number
  columns: ColumnDefinition<ModifiedSentinelMaster>[]
  masters: ModifiedSentinelMaster[]
  onBack: () => void
  onViewDatabases: () => void
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found.'

const SentinelDatabasesResult = ({
  columns,
  onBack,
  onViewDatabases,
  countSuccessAdded,
  masters,
}: Props) => {
  const [items, setItems] = useState<ModifiedSentinelMaster[]>(masters)
  const [message, setMessage] = useState(loadingMsg)

  const { loading } = useSelector(sentinelSelector)

  const countFailAdded = masters?.length - countSuccessAdded

  useEffect(() => {
    if (masters.length) {
      setItems(masters)
    }
  }, [masters])

  const handleViewDatabases = () => {
    onViewDatabases()
  }

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()

    const itemsTemp = masters.filter(
      (item: ModifiedSentinelMaster) =>
        item.name?.toLowerCase().includes(value) ||
        item.host?.toLowerCase().includes(value) ||
        item.alias?.toLowerCase().includes(value) ||
        item.username?.toLowerCase().includes(value) ||
        item.port?.toString()?.includes(value) ||
        item.numberOfSlaves?.toString().includes(value),
    )

    if (!itemsTemp.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  const SummaryText = () => (
    <Text className={styles.subTitle} data-testid="summary">
      <b>Summary: </b>
      {countSuccessAdded ? (
        <span>
          Successfully added {countSuccessAdded}
          {' primary group(s)'}
          {countFailAdded ? '; ' : ' '}
        </span>
      ) : null}
      {countFailAdded ? (
        <span>
          Failed to add {countFailAdded}
          {' primary group(s)'}
        </span>
      ) : null}
    </Text>
  )

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <Title size="XXL" className={styles.title} data-testid="title">
          Auto-Discover Redis Sentinel Primary Groups
        </Title>

        <RiRow align="end" gap="s">
          <RiFlexItem grow>
            <MessageBar opened={!!countSuccessAdded || !!countFailAdded}>
              <SummaryText />
            </MessageBar>
          </RiFlexItem>
        </RiRow>
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
        <br />
        <div className="itemList databaseList sentinelDatabaseListResult">
          {!items.length || loading ? (
            <Text>{message}</Text>
          ) : (
            <RiTable
              columns={columns}
              data={items}
              defaultSorting={[
                {
                  id: 'message',
                  desc: false,
                },
              ]}
            />
          )}
        </div>
      </div>
      <RiFlexItem padding={4}>
        <RiRow gap="m" justify="between">
          <RiSecondaryButton
            onClick={onBack}
            className="btn-cancel btn-back"
            data-testid="btn-back-to-adding"
          >
            Back to adding databases
          </RiSecondaryButton>
          <RiPrimaryButton
            size="m"
            onClick={handleViewDatabases}
            data-testid="btn-view-databases"
          >
            View Databases
          </RiPrimaryButton>
        </RiRow>
      </RiFlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default SentinelDatabasesResult
