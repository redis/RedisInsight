import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

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
import { AzureSubscription } from 'uiSrc/slices/interfaces'
import { azureAuthAccountSelector } from 'uiSrc/slices/oauth/azure'
import { Text } from 'uiSrc/components/base/text'
import {
  EmptyButton,
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Loader } from 'uiSrc/components/base/display'
import { RefreshIcon } from 'uiSrc/components/base/icons'

import { AZURE_SUBSCRIPTIONS_COLUMNS } from './AzureSubscriptions.constants'

export interface Props {
  subscriptions: AzureSubscription[]
  loading: boolean
  error: string
  onBack: () => void
  onClose: () => void
  onSubmit: (subscription: AzureSubscription) => void
  onSwitchAccount: () => void
  onRefresh: () => void
}

const AzureSubscriptions = ({
  subscriptions,
  loading,
  error,
  onBack,
  onClose,
  onSubmit,
  onSwitchAccount,
  onRefresh,
}: Props) => {
  const account = useSelector(azureAuthAccountSelector)
  const [items, setItems] = useState<AzureSubscription[]>(subscriptions)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setItems(subscriptions)
  }, [subscriptions, loading])

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()
    const filtered = subscriptions.filter(
      (item) =>
        item.displayName?.toLowerCase().includes(value) ||
        item.subscriptionId?.toLowerCase().includes(value),
    )

    setItems(filtered)
  }

  const handleSelectionChange = (state: RowSelectionState) => {
    const selectedId = Object.keys(state).find((key) => state[key])
    setSelectedId(selectedId || null)
  }

  const handleRowClick = (subscription: AzureSubscription) => {
    setSelectedId((prev) =>
      prev === subscription.subscriptionId ? null : subscription.subscriptionId,
    )
  }

  const handleSubmit = () => {
    if (!selectedId) return

    const selected = subscriptions.find((s) => s.subscriptionId === selectedId)

    if (!selected) {
      // Subscription no longer exists (e.g., after refresh), reset selection
      setSelectedId(null)
      return
    }

    onSubmit(selected)
  }

  return (
    <AutodiscoveryPageTemplate>
      <DatabaseContainer justify="start">
        <Header
          title="Azure Subscriptions"
          onBack={onBack}
          onQueryChange={onQueryChange}
          subTitle={
            account && (
              <Row gap="l" align="center">
                <Text size="M">
                  Signed in as{' '}
                  <Text component="span" variant="semiBold">
                    {account.username}
                  </Text>
                </Text>
                <EmptyButton
                  variant="primary-inline"
                  onClick={onSwitchAccount}
                  data-testid="btn-switch-account"
                >
                  Switch account
                </EmptyButton>
                <IconButton
                  icon={RefreshIcon}
                  onClick={onRefresh}
                  disabled={loading}
                  aria-label="Refresh subscriptions"
                  data-testid="btn-refresh-subscriptions"
                />
              </Row>
            )
          }
        />
        <Spacer size="m" />
        <DatabaseWrapper>
          <Table
            rowSelectionMode="single"
            rowSelection={selectedId ? { [selectedId]: true } : {}}
            onRowSelectionChange={handleSelectionChange}
            onRowClick={handleRowClick}
            getRowId={(row) => row.subscriptionId}
            columns={AZURE_SUBSCRIPTIONS_COLUMNS}
            data={items}
            defaultSorting={[{ id: 'displayName', desc: false }]}
            paginationEnabled={items.length > 10}
            stripedRows
            emptyState={() =>
              loading ? (
                <Col full centered>
                  <Loader size="xl" data-testid="azure-subscriptions-loader" />
                </Col>
              ) : (
                <EmptyState
                  message={
                    error || 'No Azure subscriptions found for this account.'
                  }
                />
              )
            }
          />
        </DatabaseWrapper>
      </DatabaseContainer>

      <Spacer size="m" />

      <Footer>
        <Row justify="end">
          <Row gap="m" grow={false}>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton
              disabled={!selectedId || loading}
              loading={loading}
              onClick={handleSubmit}
            >
              Show Databases
            </PrimaryButton>
          </Row>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default AzureSubscriptions
