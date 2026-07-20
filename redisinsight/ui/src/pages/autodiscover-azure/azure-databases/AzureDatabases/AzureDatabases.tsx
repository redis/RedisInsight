import React, { useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'uiSrc/i18n'
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
import { AzureAuthType, AzureRedisDatabase } from 'uiSrc/slices/interfaces'
import { Text } from 'uiSrc/components/base/text'
import {
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Loader } from 'uiSrc/components/base/display'
import { RefreshIcon } from 'uiSrc/components/base/icons'
import {
  RiRadioGroupRoot,
  RiRadioGroupItemRoot,
  RiRadioGroupItemIndicator,
  RiRadioGroupItemLabel,
} from 'uiSrc/components/base/forms/radio-group/RadioGroup'

import {
  getAzureDatabasesColumns,
  MAX_DATABASES_SELECTION,
} from './AzureDatabases.constants'

export interface Props {
  databases: AzureRedisDatabase[]
  selectedDatabases: AzureRedisDatabase[]
  subscriptionName: string
  loading: boolean
  error: string
  authType: AzureAuthType
  onBack: () => void
  onClose: () => void
  onSubmit: () => void
  onSelectionChange: (databases: AzureRedisDatabase[]) => void
  onAuthTypeChange: (authType: AzureAuthType) => void
  onRefresh: () => void
  onManualConnection: () => void
}

const AzureDatabases = ({
  databases,
  selectedDatabases,
  subscriptionName,
  loading,
  error,
  authType,
  onBack,
  onClose,
  onSubmit,
  onSelectionChange,
  onAuthTypeChange,
  onRefresh,
  onManualConnection,
}: Props) => {
  const { t } = useTranslation()
  const columns = useMemo(() => getAzureDatabasesColumns(t), [t])
  const [items, setItems] = useState<AzureRedisDatabase[]>(databases)

  useEffect(() => {
    setItems(databases)
  }, [databases])

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

  const selectedCount = Object.values(rowSelection).filter(Boolean).length
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
          title={t('autodiscover.azure.databases.title')}
          onBack={onBack}
          onQueryChange={onQueryChange}
          backButtonText={t('autodiscover.azure.databases.backButton')}
          subTitle={
            <Row gap="l" align="center">
              <Text size="M">
                {t('autodiscover.azure.databases.subscription')}{' '}
                <Text component="span" variant="semiBold">
                  {subscriptionName}
                </Text>
              </Text>
              <IconButton
                icon={RefreshIcon}
                onClick={onRefresh}
                disabled={loading}
                aria-label={t('autodiscover.azure.databases.refreshAria')}
                data-testid="btn-refresh-databases"
              />
              <Text size="M">|</Text>
              <Text size="M">{t('autodiscover.azure.databases.auth')}</Text>
              <RiRadioGroupRoot
                value={authType}
                onChange={(value) => onAuthTypeChange(value as AzureAuthType)}
                data-testid="auth-type-radio-group"
              >
                <Row gap="l">
                  <Row gap="xs" align="center">
                    <RiRadioGroupItemRoot
                      value={AzureAuthType.EntraId}
                      data-testid="auth-type-entra-id"
                    >
                      <RiRadioGroupItemIndicator />
                      <RiRadioGroupItemLabel>
                        {t('autodiscover.azure.databases.authEntraId')}
                      </RiRadioGroupItemLabel>
                    </RiRadioGroupItemRoot>
                  </Row>
                  <Row gap="xs" align="center">
                    <RiRadioGroupItemRoot
                      value={AzureAuthType.AccessKey}
                      data-testid="auth-type-access-key"
                    >
                      <RiRadioGroupItemIndicator />
                      <RiRadioGroupItemLabel>
                        {t('autodiscover.azure.databases.authAccessKey')}
                      </RiRadioGroupItemLabel>
                    </RiRadioGroupItemRoot>
                  </Row>
                </Row>
              </RiRadioGroupRoot>
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
            columns={columns}
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
                  message={error || t('autodiscover.azure.databases.empty')}
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
              {t('autodiscover.azure.databases.maxSelection', {
                max: MAX_DATABASES_SELECTION,
              })}
            </Text>
          ) : (
            <div />
          )}
          <Row gap="m" grow={false}>
            <SecondaryButton onClick={onClose}>
              {t('autodiscover.azure.button.cancel')}
            </SecondaryButton>
            <SecondaryButton
              data-testid="btn-manual-connection"
              onClick={onManualConnection}
            >
              {t('autodiscover.azure.button.manualConnection')}
            </SecondaryButton>
            <PrimaryButton
              data-testid="btn-submit"
              disabled={selectedDatabases.length === 0 || loading}
              loading={loading}
              onClick={onSubmit}
            >
              {selectedDatabases.length > 0
                ? t('autodiscover.azure.databases.addButton', {
                    count: selectedDatabases.length,
                  })
                : t('autodiscover.azure.databases.addButtonEmpty')}
            </PrimaryButton>
          </Row>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default AzureDatabases
