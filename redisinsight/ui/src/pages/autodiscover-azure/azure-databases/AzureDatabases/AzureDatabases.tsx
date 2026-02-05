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
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Loader } from 'uiSrc/components/base/display'
import { RefreshIcon } from 'uiSrc/components/base/icons'

import {
  AZURE_DATABASES_COLUMNS,
  MAX_DATABASES_SELECTION,
} from './AzureDatabases.constants'

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
  onRefresh: () => void
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
  onRefresh,
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

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // Sync rowSelection with selectedDatabases prop (e.g., when parent resets on refresh)
  useEffect(() => {
    const newSelection: RowSelectionState = {}
    selectedDatabases.forEach((db) => {
      newSelection[db.id] = true
    })
    setRowSelection(newSelection)
  }, [selectedDatabases])

  const selectedCount = Object.keys(rowSelection).length
  const isMaxSelected = selectedCount >= MAX_DATABASES_SELECTION

  const handleSelectionChange = (state: RowSelectionState) => {
    const selectedIds = Object.keys(state).filter((id) => state[id])

    // If trying to select more than max, limit to max
    if (selectedIds.length > MAX_DATABASES_SELECTION) {
      const limitedIds = selectedIds.slice(0, MAX_DATABASES_SELECTION)
      const limitedState: RowSelectionState = {}
      limitedIds.forEach((id) => {
        limitedState[id] = true
      })
      setRowSelection(limitedState)
      onSelectionChange(databases.filter((db) => limitedState[db.id]))
      return
    }

    setRowSelection(state)
    onSelectionChange(databases.filter((db) => state[db.id]))
  }

  const handleRowClick = (database: AzureRedisDatabase) => {
    const isSelected = rowSelection[database.id]

    // Don't allow selecting more if max is reached
    if (!isSelected && isMaxSelected) {
      return
    }

    const newSelection = { ...rowSelection, [database.id]: !isSelected }

    if (isSelected) {
      delete newSelection[database.id]
    }

    handleSelectionChange(newSelection)
  }

  const canSelectRow = (row: { original: AzureRedisDatabase }) =>
    rowSelection[row.original.id] || !isMaxSelected

  return (
    <AutodiscoveryPageTemplate>
      <DatabaseContainer justify="start">
        <Header
          title="Azure Redis Databases"
          onBack={onBack}
          onQueryChange={onQueryChange}
          backButtonText="Subscriptions"
          subTitle={
            <Row gap="l" align="center">
              <Text size="M">
                Subscription:{' '}
                <Text component="span" variant="semiBold">
                  {subscriptionName}
                </Text>
              </Text>
              <IconButton
                icon={RefreshIcon}
                onClick={onRefresh}
                disabled={loading}
                aria-label="Refresh databases"
                data-testid="btn-refresh-databases"
              />
            </Row>
          }
        />
        <Spacer size="m" />
        <DatabaseWrapper>
          <Table
            rowSelectionMode="multiple"
            rowSelection={rowSelection}
            onRowSelectionChange={handleSelectionChange}
            onRowClick={handleRowClick}
            getRowId={(row) => row.id}
            getRowCanSelect={canSelectRow}
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

      <Spacer size="l" />

      <Footer>
        <Row justify="between" align="center">
          {isMaxSelected ? (
            <Text size="S" data-testid="max-selection-message">
              Maximum of {MAX_DATABASES_SELECTION} databases can be added at a
              time.
            </Text>
          ) : (
            <div />
          )}
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
