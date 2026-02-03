import React, { useEffect, useState } from 'react'

import { Spacer } from 'uiSrc/components/base/layout'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'
import {
  type RowSelectionState,
  Table,
} from 'uiSrc/components/base/layout/table'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import {
  DatabaseContainer,
  DatabaseWrapper,
  EmptyState,
  Footer,
  Header,
} from 'uiSrc/components/auto-discover'
import { AzureRedisDatabase } from 'uiSrc/slices/interfaces'
import { Text } from 'uiSrc/components/base/text'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Loader } from 'uiSrc/components/base/display'

import { AZURE_DATABASES_COLUMNS } from './AzureDatabases.constants'

export interface Props {
  databases: AzureRedisDatabase[]
  selectedDatabases: AzureRedisDatabase[]
  subscriptionName: string
  loading: boolean
  error: string
  onBack: () => void
  onClose: () => void
  onSubmit: () => void
  onSelectionChange: (databases: AzureRedisDatabase[]) => void
}

const AzureDatabases = ({
  databases,
  selectedDatabases,
  subscriptionName,
  loading,
  error,
  onBack,
  onClose,
  onSubmit,
  onSelectionChange,
}: Props) => {
  const [items, setItems] = useState<AzureRedisDatabase[]>(databases)

  useEffect(() => {
    setItems(databases)
  }, [databases, loading])

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()
    const filtered = databases.filter(
      (item) =>
        item.name?.toLowerCase().includes(value) ||
        item.host?.toLowerCase().includes(value) ||
        item.resourceGroup?.toLowerCase().includes(value),
    )

    setItems(filtered)
  }

  const handleSelectionChange = (state: RowSelectionState) => {
    const selected = databases.filter((db) => state[db.id])
    onSelectionChange(selected)
  }

  return (
    <AutodiscoveryPageTemplate>
      <DatabaseContainer justify="start">
        <Header
          title="Azure Redis Databases"
          onBack={onBack}
          onQueryChange={onQueryChange}
          subTitle={
            <Text size="M">
              Subscription:{' '}
              <Text component="span" variant="semiBold">
                {subscriptionName}
              </Text>
            </Text>
          }
        />
        <Spacer size="m" />
        <DatabaseWrapper>
          <Table
            rowSelectionMode="multiple"
            onRowSelectionChange={handleSelectionChange}
            getRowId={(row) => row.id}
            columns={AZURE_DATABASES_COLUMNS}
            data={items}
            defaultSorting={[{ id: 'name', desc: false }]}
            paginationEnabled={items.length > 10}
            stripedRows
            emptyState={() =>
              loading ? (
                <Col full centered>
                  <Loader size="xl" data-testid="azure-databases-loader" />
                </Col>
              ) : (
                <EmptyState
                  message={
                    error || 'No Redis databases found in this subscription.'
                  }
                />
              )
            }
          />
        </DatabaseWrapper>
      </DatabaseContainer>

      <Footer>
        <Row justify="end">
          <Row gap="m" grow={false}>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton
              data-testid="btn-submit"
              disabled={selectedDatabases.length === 0 || loading}
              loading={loading}
              onClick={onSubmit}
            >
              Add{' '}
              {selectedDatabases.length > 0
                ? `(${selectedDatabases.length})`
                : ''}{' '}
              Database
              {selectedDatabases.length !== 1 ? 's' : ''}
            </PrimaryButton>
          </Row>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default AzureDatabases
