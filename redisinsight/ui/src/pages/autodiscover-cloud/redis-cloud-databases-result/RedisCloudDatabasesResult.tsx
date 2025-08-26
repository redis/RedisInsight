import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  InstanceRedisCloud,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'
import { cloudSelector } from 'uiSrc/slices/instances/cloud'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { SearchInput } from 'uiSrc/components/base/inputs'
import { Text } from 'uiSrc/components/base/text'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'
import { Spacer } from 'uiSrc/components/base/layout'
import {
  DatabaseWrapper,
  Footer,
  PageTitle,
  SearchForm,
} from 'uiSrc/components/auto-discover'

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
    <Text color="secondary" size="S">
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
        <PageTitle data-testid="title">
          Redis Enterprise Databases Added
        </PageTitle>
        <Row justify="end" gap="s">
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
          <PrimaryButton onClick={onView} data-testid="btn-view-databases">
            View Databases
          </PrimaryButton>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisCloudDatabaseListResult
