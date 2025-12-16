import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text, Title } from 'uiSrc/components/base/text/Text'
import {
  EmptyButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Spinner } from 'uiSrc/components/base/spinner/Spinner'
import { IpcInvokeEvent } from 'uiSrc/electron/constants'
import { Pages } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { addSuccessNotification } from 'uiSrc/slices/app/notifications'
import { fetchInstancesAction } from 'uiSrc/slices/instances/instances'
import {
  azureSelector,
  checkAzureAuthStatus,
  fetchAzureDatabases,
  logoutAzure,
  AzureDatabase,
} from 'uiSrc/slices/azure/azure'
import { ScrollableWrapper } from '../ManualConnection.styles'
import {
  Container,
  DatabaseItem,
  DatabaseList,
  TypeBadge,
  UserInfo,
} from './AzureConnectionForm.styles'

export interface Props {
  onClose?: () => void
}

const AzureConnectionForm = (props: Props) => {
  const { onClose } = props
  const dispatch = useDispatch()
  const history = useHistory()
  const { isLoggedIn, loading, user, databases, databasesLoading } =
    useSelector(azureSelector)

  useEffect(() => {
    dispatch(checkAzureAuthStatus())
  }, [dispatch])

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchAzureDatabases())
    }
  }, [isLoggedIn, dispatch])

  const handleLogin = async () => {
    await window.app?.ipc?.invoke?.(IpcInvokeEvent.azureOauth)
  }

  const handleLogout = () => {
    dispatch(logoutAzure())
  }

  const handleRefresh = () => {
    dispatch(fetchAzureDatabases())
  }

  const handleConnect = async (database: AzureDatabase) => {
    try {
      const { data } = await apiService.post(
        '/azure/databases/connection-details',
        {
          subscriptionId: database.subscriptionId,
          resourceGroup: database.resourceGroup,
          name: database.name,
          type: database.type,
        },
      )

      const payload = {
        name: database.name,
        host: database.host,
        port: data.port || database.port,
        password: data.accessKey,
        tls: true,
      }

      await apiService.post('/databases', payload)

      dispatch(addSuccessNotification({ title: `Database "${database.name}" added successfully` }))
      dispatch(fetchInstancesAction())
      history.push(Pages.home)
      onClose?.()
    } catch (error) {
      // Error handled by apiService
    }
  }

  if (loading) {
    return (
      <Container align="center" justify="center">
        <Spinner />
        <Spacer />
        <Text>Checking authentication status...</Text>
      </Container>
    )
  }

  if (!isLoggedIn) {
    return (
      <ScrollableWrapper>
        <Container gap="l">
          <Title size="L" color="primary">
            Connect with Azure
          </Title>
          <Text>
            Sign in with your Microsoft account to discover and connect to your
            Azure Cache for Redis databases.
          </Text>
          <Spacer size="l" />
          <Row justify="center">
            <PrimaryButton onClick={handleLogin} data-testid="azure-login-btn">
              Sign in with Microsoft
            </PrimaryButton>
          </Row>
        </Container>
      </ScrollableWrapper>
    )
  }

  return (
    <ScrollableWrapper>
      <Container gap="l">
        <Row justify="between" align="center">
          <Title size="L" color="primary">
            Azure Databases
          </Title>
          <Row gap="m">
            <EmptyButton onClick={handleRefresh} disabled={databasesLoading}>
              Refresh
            </EmptyButton>
            <SecondaryButton onClick={handleLogout}>Sign out</SecondaryButton>
          </Row>
        </Row>

        {user && (
          <UserInfo gap="s">
            <Text variant="semiBold">{user.name || user.upn}</Text>
            <Text color="secondary">{user.upn}</Text>
          </UserInfo>
        )}

        {databasesLoading ? (
          <Row justify="center">
            <Spinner />
          </Row>
        ) : databases.length === 0 ? (
          <Text color="secondary">
            No Azure Cache for Redis databases found in your subscriptions.
          </Text>
        ) : (
          <DatabaseList gap="s">
            {databases.map((db) => (
              <DatabaseItem
                key={db.id}
                justify="between"
                align="center"
                onClick={() => handleConnect(db)}
                data-testid={`azure-db-${db.name}`}
              >
                <Col gap="xs">
                  <Row gap="s" align="center">
                    <Text variant="semiBold">{db.name}</Text>
                    <TypeBadge $type={db.type}>{db.type}</TypeBadge>
                  </Row>
                  <Text color="secondary" size="s">
                    {db.host}:{db.port}
                  </Text>
                  <Text color="secondary" size="s">
                    {db.subscriptionName} / {db.resourceGroup}
                  </Text>
                </Col>
                <FlexItem>
                  <PrimaryButton size="s">Connect</PrimaryButton>
                </FlexItem>
              </DatabaseItem>
            ))}
          </DatabaseList>
        )}
      </Container>
    </ScrollableWrapper>
  )
}

export default AzureConnectionForm

