import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { SearchInput } from 'uiSrc/components/base/inputs'

import { sentinelSelector } from 'uiSrc/slices/instances/sentinel'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'

import {
  DatabaseWrapper,
  Footer,
  PageTitle,
  SearchForm,
} from 'uiSrc/components/auto-discover'
import { Spacer } from 'uiSrc/components/base/layout'

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
        item.name?.toLowerCase()?.includes(value) ||
        (item.host || '')?.toLowerCase()?.includes(value) ||
        item.alias?.toLowerCase()?.includes(value) ||
        (item.username || '')?.toLowerCase()?.includes(value) ||
        item.port?.toString()?.includes(value) ||
        item.numberOfSlaves?.toString().includes(value),
    )

    if (!itemsTemp.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  const SummaryText = () => (
    <Text color="secondary" size="S" data-testid="summary">
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
        <PageTitle data-testid="title">
          Auto-Discover Redis Sentinel Primary Groups
        </PageTitle>

        <Row align="end" gap="s">
          <FlexItem>
            <SearchForm>
              <SearchInput
                placeholder="Search..."
                onChange={onQueryChange}
                aria-label="Search"
                data-testid="search"
              />
            </SearchForm>
          </FlexItem>
        </Row>
        <Spacer size="l" />
        <DatabaseWrapper>
          {!items.length || loading ? (
            <Text>{message}</Text>
          ) : (
            <Table
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
        </DatabaseWrapper>
        <MessageBar opened={!!countSuccessAdded || !!countFailAdded}>
          <SummaryText />
        </MessageBar>
      </div>
      <Footer padding={4}>
        <Row justify="between">
          <SecondaryButton
            onClick={onBack}
            className="btn-cancel btn-back"
            data-testid="btn-back-to-adding"
          >
            Back to adding databases
          </SecondaryButton>
          <PrimaryButton
            size="m"
            onClick={handleViewDatabases}
            data-testid="btn-view-databases"
          >
            View Databases
          </PrimaryButton>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default SentinelDatabasesResult
