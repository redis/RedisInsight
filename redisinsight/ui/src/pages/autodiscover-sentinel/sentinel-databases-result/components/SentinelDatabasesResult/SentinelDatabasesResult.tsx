import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { sentinelSelector } from 'uiSrc/slices/instances/sentinel'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { ColumnDef, Table } from 'uiSrc/components/base/layout/table'

import {
  DatabaseContainer,
  DatabaseWrapper,
  Footer,
} from 'uiSrc/components/auto-discover'
import { Spacer } from 'uiSrc/components/base/layout'
import { Header } from 'uiSrc/components/auto-discover/Header'

export interface Props {
  countSuccessAdded: number
  columns: ColumnDef<ModifiedSentinelMaster>[]
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
    <div data-testid="summary">
      <Text size="S" component="span" variant="semiBold">
        Summary:&nbsp;
      </Text>
      {countSuccessAdded ? (
        <Text size="S" component="span">
          Successfully added {countSuccessAdded}
          {' primary group(s)'}
          {countFailAdded ? '; ' : ' '}
        </Text>
      ) : null}
      {countFailAdded ? (
        <Text size="S" component="span">
          Failed to add {countFailAdded}
          {' primary group(s)'}
        </Text>
      ) : null}
    </div>
  )

  return (
    <AutodiscoveryPageTemplate>
      <DatabaseContainer justify="start">
        <Header
          title="Auto-Discover Redis Sentinel Primary Groups"
          onBack={onBack}
          onQueryChange={onQueryChange}
        />

        <Spacer size="m" />
        <DatabaseWrapper>
          {!items.length || loading ? (
            <Col full centered>
              <Text size="XL" variant="semiBold">
                {message}
              </Text>
            </Col>
          ) : (
            <Table
              rowSelectionMode={undefined}
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
      </DatabaseContainer>
      <Footer>
        <Row justify="end">
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
