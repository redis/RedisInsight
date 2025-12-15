import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Loader } from 'uiSrc/components/base/display'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { RefreshIcon } from 'uiSrc/components/base/icons'
import {
  useAzureResources,
  useAzureSsoStore,
  azureResourcesStore,
  AzureRedisResource,
  AzureRedisDatabase,
} from 'uiSrc/hooks/useAzureSso'
import {
  fetchAzureRedisResources,
  getAzureRedisConnectionDetails,
} from 'uiSrc/electron/components/ConfigAzureSso/ConfigAzureSso'
import { createInstanceStandaloneAction } from 'uiSrc/slices/instances/instances'
import { Instance } from 'uiSrc/slices/interfaces'
import { AppDispatch } from 'uiSrc/slices/store'

interface FlattenedDatabase {
  id: string
  name: string
  type: 'standard' | 'enterprise'
  host: string
  port: number
  subscription: string
  location: string
  resource: AzureRedisResource
  database: AzureRedisDatabase | null
}

const AzureDatabasesList = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoggedIn, user } = useAzureSsoStore()
  const { resources, loading, error } = useAzureResources()
  const [connectingId, setConnectingId] = useState<string | null>(null)

  const handleRefresh = useCallback(async () => {
    if (!user?.accessToken) return

    azureResourcesStore.setLoading(true)
    const result = await fetchAzureRedisResources(user.accessToken)

    if (result.isComplete) {
      azureResourcesStore.setResources(result.resources)
    } else {
      azureResourcesStore.setError('Failed to refresh resources')
    }
  }, [user?.accessToken])

  const handleConnect = useCallback(async (db: FlattenedDatabase) => {
    if (!user?.accessToken) return

    setConnectingId(db.id)

    try {
      const connectionDetails = await getAzureRedisConnectionDetails(
        db.resource,
        db.database,
        user.accessToken,
      )

      if (!connectionDetails) {
        // eslint-disable-next-line no-console
        console.error('[Azure] Failed to get connection details')
        setConnectingId(null)
        return
      }

      const payload: Partial<Instance> = {
        name: connectionDetails.name,
        host: connectionDetails.host,
        port: connectionDetails.port,
        tls: connectionDetails.tls,
        password: connectionDetails.password,
        verifyServerCert: false,
      }

      dispatch(createInstanceStandaloneAction(
        payload as Instance,
        undefined,
        () => {
          setConnectingId(null)
        },
      ))
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Azure] Error connecting:', err)
      setConnectingId(null)
    }
  }, [user?.accessToken, dispatch])

  // Don't show anything if not logged in
  if (!isLoggedIn) {
    return null
  }

  if (loading) {
    return (
      <Row align="center" gap="m" style={{ padding: '16px' }}>
        <Loader size="m" />
        <Text>Loading Azure Redis databases...</Text>
      </Row>
    )
  }

  if (error) {
    return (
      <Row style={{ padding: '16px' }}>
        <Text color="danger">Error: {error}</Text>
      </Row>
    )
  }

  if (resources.length === 0) {
    return (
      <Row style={{ padding: '16px' }}>
        <Text>No Azure Redis databases found.</Text>
      </Row>
    )
  }

  // Flatten resources to include both standard and enterprise databases
  const flattenedDatabases: FlattenedDatabase[] = []

  resources.forEach((resource: AzureRedisResource) => {
    if (resource.resourceType === 'Microsoft.Cache/redis') {
      // Standard Redis
      flattenedDatabases.push({
        id: resource.id,
        name: resource.name,
        type: 'standard',
        host: resource.properties?.hostName || 'N/A',
        port: resource.properties?.sslPort || 6380,
        subscription: resource.subscriptionName,
        location: resource.location,
        resource,
        database: null,
      })
    } else if (resource.resourceType === 'Microsoft.Cache/redisEnterprise') {
      // Enterprise Redis - each database is a separate entry
      resource.databases?.forEach((db) => {
        flattenedDatabases.push({
          id: db.id,
          name: `${resource.name}/${db.name}`,
          type: 'enterprise',
          host: resource.properties?.hostName || 'N/A',
          port: db.properties?.port || 10000,
          subscription: resource.subscriptionName,
          location: resource.location,
          resource,
          database: db,
        })
      })
    }
  })

  return (
    <div style={{ padding: '16px', marginBottom: '16px', border: '1px solid #ccc' }}>
      <Row align="center" justify="between" style={{ marginBottom: '12px' }}>
        <Text style={{ fontWeight: 'bold' }}>
          Azure Redis Databases ({flattenedDatabases.length})
        </Text>
        <EmptyButton
          onClick={handleRefresh}
          disabled={loading}
          icon={RefreshIcon}
          data-testid="azure-refresh-btn"
        >
          Refresh
        </EmptyButton>
      </Row>
      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {flattenedDatabases.map((db) => {
          const isConnecting = connectingId === db.id
          return (
            <Row
              key={db.id}
              align="center"
              justify="between"
              onClick={() => !isConnecting && handleConnect(db)}
              style={{
                padding: '8px 12px',
                marginBottom: '4px',
                backgroundColor: isConnecting ? '#e0e0e0' : '#f5f5f5',
                borderRadius: '4px',
                cursor: isConnecting ? 'wait' : 'pointer',
                opacity: isConnecting ? 0.7 : 1,
              }}
            >
              <div>
                <Text style={{ fontWeight: 500 }}>{db.name}</Text>
                <Text style={{ fontSize: '12px', color: '#666' }}>
                  {db.host}:{db.port} • {db.subscription} • {db.location}
                </Text>
              </div>
              <Row align="center" gap="s">
                {isConnecting && <Loader size="s" />}
                <Text
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    backgroundColor: db.type === 'enterprise' ? '#0066cc' : '#009900',
                    color: 'white',
                  }}
                >
                  {db.type}
                </Text>
              </Row>
            </Row>
          )
        })}
      </div>
    </div>
  )
}

export default AzureDatabasesList

