import React, { useEffect, useState } from 'react'

import {
  AddRedisDatabaseStatus,
  InstanceRedisCluster,
} from 'uiSrc/slices/interfaces'
import { setTitle } from 'uiSrc/utils'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { ColumnDef, Table } from 'uiSrc/components/base/layout/table'
import {
  DatabaseContainer,
  DatabaseWrapper,
  Footer,
  Header,
} from 'uiSrc/components/auto-discover'
import { Spacer } from 'uiSrc/components/base/layout'

export interface Props {
  columns: ColumnDef<InstanceRedisCluster>[]
  instances: InstanceRedisCluster[]
  onView: (sendEvent?: boolean) => void
  onBack: (sendEvent?: boolean) => void
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'

const RedisClusterDatabasesResult = ({
  columns,
  instances,
  onBack,
  onView,
}: Props) => {
  const [items, setItems] = useState<InstanceRedisCluster[]>([])
  const [message, setMessage] = useState(loadingMsg)

  useEffect(() => {
    setTitle('Redis Enterprise Databases Added')
  }, [])

  useEffect(() => {
    setItems(instances)
  }, [instances])

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
      <ColorText variant="semiBold">Summary: </ColorText>
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
      <DatabaseContainer justify="start">
        <Header
          title={`
          Redis Enterprise
          ${
            countSuccessAdded + countFailAdded > 1
              ? ' Databases '
              : ' Database '
          }
          Added
          `}
          onBack={onBack}
          onQueryChange={onQueryChange}
        />
        <MessageBar
          opened={!!countSuccessAdded || !!countFailAdded}
          variant={!!countFailAdded ? 'attention' : 'success'}
        >
          <SummaryText />
        </MessageBar>
        <Spacer size="m" />
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
            paginationEnabled={items.length > 10}
            stripedRows
            pageSizes={[5, 10, 25, 50, 100]}
            emptyState={() => (
              <Col centered full>
                <FlexItem padding={13}>
                  <Text size="L">{message}</Text>
                </FlexItem>
              </Col>
            )}
          />
        </DatabaseWrapper>
      </DatabaseContainer>
      <Footer>
        <Row justify="end">
          <PrimaryButton
            size="m"
            onClick={() => onView(false)}
            data-testid="btn-view-databases"
          >
            View Databases
          </PrimaryButton>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisClusterDatabasesResult
