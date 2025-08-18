import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RiSearchInput } from 'uiBase/inputs'

import { RiFlexItem, RiRow, RiTable, ColumnDefinition } from 'uiBase/layout'
import { RiPrimaryButton, RiSecondaryButton, RiFormField } from 'uiBase/forms'
import { RiTitle, RiText } from 'uiBase/text'
import { sentinelSelector } from 'uiSrc/slices/instances/sentinel'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

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
    <RiText className={styles.subTitle} data-testid="summary">
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
    </RiText>
  )

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <RiTitle size="XXL" className={styles.title} data-testid="title">
          Auto-Discover Redis Sentinel Primary Groups
        </RiTitle>

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
            <RiText>{message}</RiText>
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
