import React, { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

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
import { AzureSubscription } from 'uiSrc/slices/interfaces'
import {
  azureAuthAccountSelector,
  azureAuthTenantSelector,
} from 'uiSrc/slices/oauth/azure'
import { Text } from 'uiSrc/components/base/text'
import {
  EmptyButton,
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Loader } from 'uiSrc/components/base/display'
import { RefreshIcon } from 'uiSrc/components/base/icons'

import { getAzureSubscriptionsColumns } from './AzureSubscriptions.constants'

export interface Props {
  subscriptions: AzureSubscription[]
  loading: boolean
  error: string
  onBack: () => void
  onClose: () => void
  onSubmit: (subscription: AzureSubscription) => void
  onSwitchAccount: () => void
  onRefresh: () => void
  onManualConnection: () => void
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
  onManualConnection,
}: Props) => {
  const { t } = useTranslation()
  const columns = useMemo(() => getAzureSubscriptionsColumns(t), [t])
  const account = useAppSelector(azureAuthAccountSelector)
  const tenant = useAppSelector(azureAuthTenantSelector)
  const [items, setItems] = useState<AzureSubscription[]>(subscriptions)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setItems(subscriptions)
  }, [subscriptions])

  // Reset selection if selected subscription no longer exists (e.g., after refresh)
  useEffect(() => {
    if (
      selectedId &&
      !subscriptions.some((s) => s.subscriptionId === selectedId)
    ) {
      setSelectedId(null)
    }
  }, [subscriptions, selectedId])

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
    const newSelectedId = Object.keys(state).find((key) => state[key])
    setSelectedId(newSelectedId || null)
  }

  const handleRowClick = (subscription: AzureSubscription) => {
    const isSelected = selectedId === subscription.subscriptionId
    const newState: RowSelectionState = isSelected
      ? {}
      : { [subscription.subscriptionId]: true }

    handleSelectionChange(newState)
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
          title={t('autodiscover.azure.subscriptions.title')}
          onBack={onBack}
          onQueryChange={onQueryChange}
          subTitle={
            account && (
              <Row gap="l" align="center">
                <Text size="M">
                  {t('autodiscover.azure.subscriptions.signedInAs')}{' '}
                  <Text component="span" variant="semiBold">
                    {account.username}
                  </Text>
                </Text>
                {tenant && (
                  <Text size="M" data-testid="azure-active-tenant">
                    {t('autodiscover.azure.subscriptions.tenant')}{' '}
                    <Text component="span" variant="semiBold">
                      {tenant}
                    </Text>
                  </Text>
                )}
                <EmptyButton
                  variant="primary-inline"
                  onClick={onSwitchAccount}
                  data-testid="btn-switch-account"
                >
                  {t('autodiscover.azure.subscriptions.switchAccount')}
                </EmptyButton>
                <IconButton
                  icon={RefreshIcon}
                  onClick={onRefresh}
                  disabled={loading}
                  aria-label={t('autodiscover.azure.subscriptions.refreshAria')}
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
            columns={columns}
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
                  message={error || t('autodiscover.azure.subscriptions.empty')}
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
              disabled={!selectedId || loading}
              loading={loading}
              onClick={handleSubmit}
            >
              {t('autodiscover.azure.subscriptions.showDatabases')}
            </PrimaryButton>
          </Row>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default AzureSubscriptions
