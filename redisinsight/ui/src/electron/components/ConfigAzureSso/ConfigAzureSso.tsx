import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  addMessageNotification,
  addErrorNotification,
} from 'uiSrc/slices/app/notifications'
import { azureSsoStore } from 'uiSrc/hooks/useAzureSso'

interface AzureSsoAuthResult {
  status: 'succeed' | 'failed'
  message?: string
  error?: any
  data?: {
    accessToken: string
    expiresOn: Date
    oid: string
    upn: string
  }
}

// Azure Resource Manager API endpoints
const AZURE_API_BASE = 'https://management.azure.com'
const API_VERSION_SUBSCRIPTIONS = '2022-12-01'
const API_VERSION_REDIS = '2023-08-01'
const API_VERSION_REDIS_ENTERPRISE = '2024-09-01-preview'

// Helper to fetch resources with error handling
const fetchAzureApi = async (
  url: string,
  accessToken: string,
  method: 'GET' | 'POST' = 'GET',
) => {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  return response
}

// Connection details for a Redis database
export interface AzureRedisConnectionDetails {
  host: string
  port: number
  tls: boolean
  authType: 'accessKey' | 'entraId'
  password?: string // For accessKey auth
  accessToken?: string // For Entra ID auth
  name: string
  resourceType: 'standard' | 'enterprise'
}

/**
 * Get connection details for a selected Azure Redis database.
 * Handles both Standard Redis and Redis Enterprise, and both auth types.
 */
export const getAzureRedisConnectionDetails = async (
  resource: any,
  database: any | null, // null for standard Redis (no sub-databases)
  accessToken: string,
): Promise<AzureRedisConnectionDetails | null> => {
  try {
    const isEnterprise = resource.resourceType === 'Microsoft.Cache/redisEnterprise'

    // eslint-disable-next-line no-console
    console.log('[Azure SSO] Getting connection details for:', {
      name: resource.name,
      isEnterprise,
      database: database?.name,
    })

    if (isEnterprise) {
      // Redis Enterprise / Azure Managed Redis
      if (!database) {
        // eslint-disable-next-line no-console
        console.error('[Azure SSO] Enterprise resource requires a database selection')
        return null
      }

      const host = resource.properties?.hostName
      const port = database.properties?.port || 10000
      const tls = database.properties?.clientProtocol === 'Encrypted'
      const accessKeysEnabled = database.properties?.accessKeysAuthentication === 'Enabled'

      // eslint-disable-next-line no-console
      console.log('[Azure SSO] Enterprise database config:', {
        host,
        port,
        tls,
        accessKeysEnabled,
      })

      if (accessKeysEnabled) {
        // Fetch access keys using listKeys API
        // The database ID looks like: /subscriptions/.../databases/default
        const listKeysUrl = `${AZURE_API_BASE}${database.id}/listKeys?api-version=${API_VERSION_REDIS_ENTERPRISE}`

        // eslint-disable-next-line no-console
        console.log('[Azure SSO] Fetching access keys...')

        const keysResponse = await fetchAzureApi(listKeysUrl, accessToken, 'POST')

        if (keysResponse.ok) {
          const keysData = await keysResponse.json()
          // eslint-disable-next-line no-console
          console.log('[Azure SSO] Access keys retrieved successfully')

          return {
            host,
            port,
            tls,
            authType: 'accessKey',
            password: keysData.primaryKey,
            name: `${resource.name}/${database.name}`,
            resourceType: 'enterprise',
          }
        }
        // eslint-disable-next-line no-console
        console.error('[Azure SSO] Failed to fetch access keys:', await keysResponse.text())
        return null
      }
      // Entra ID (AAD) authentication
      // eslint-disable-next-line no-console
      console.log('[Azure SSO] Using Entra ID authentication')

      return {
        host,
        port,
        tls,
        authType: 'entraId',
        accessToken,
        name: `${resource.name}/${database.name}`,
        resourceType: 'enterprise',
      }
    }
    // Standard Azure Cache for Redis
    const host = resource.properties?.hostName
    const port = resource.properties?.sslPort || 6380
    const tls = true // Standard Redis always uses TLS on sslPort

    // eslint-disable-next-line no-console
    console.log('[Azure SSO] Standard Redis config:', { host, port, tls })

    // Fetch access keys for standard Redis
    // Resource ID looks like: /subscriptions/.../providers/Microsoft.Cache/redis/name
    const listKeysUrl = `${AZURE_API_BASE}${resource.id}/listKeys?api-version=${API_VERSION_REDIS}`

    // eslint-disable-next-line no-console
    console.log('[Azure SSO] Fetching access keys for standard Redis...')

    const keysResponse = await fetchAzureApi(listKeysUrl, accessToken, 'POST')

    if (keysResponse.ok) {
      const keysData = await keysResponse.json()
      // eslint-disable-next-line no-console
      console.log('[Azure SSO] Access keys retrieved successfully')

      return {
        host,
        port,
        tls,
        authType: 'accessKey',
        password: keysData.primaryKey,
        name: resource.name,
        resourceType: 'standard',
      }
    }
    // eslint-disable-next-line no-console
    console.error('[Azure SSO] Failed to fetch access keys:', await keysResponse.text())
    return null
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Azure SSO] Error getting connection details:', error)
    return null
  }
}

// Progress tracking
interface FetchProgress {
  phase: string
  subscriptionsTotal: number
  subscriptionsCurrent: number
  clustersTotal: number
  clustersCurrent: number
  startTime: number
}

const logProgress = (progress: FetchProgress) => {
  const elapsed = ((Date.now() - progress.startTime) / 1000).toFixed(1)
  // eslint-disable-next-line no-console
  console.log(
    `[Azure SSO] [${elapsed}s] ${progress.phase} - ` +
    `Subscriptions: ${progress.subscriptionsCurrent}/${progress.subscriptionsTotal}, ` +
    `Clusters: ${progress.clustersCurrent}/${progress.clustersTotal}`,
  )
}

const fetchAzureRedisResources = async (accessToken: string) => {
  const progress: FetchProgress = {
    phase: 'Starting',
    subscriptionsTotal: 0,
    subscriptionsCurrent: 0,
    clustersTotal: 0,
    clustersCurrent: 0,
    startTime: Date.now(),
  }

  try {
    // Step 1: Get all subscriptions
    progress.phase = 'Fetching subscriptions'
    logProgress(progress)

    const subscriptionsResponse = await fetchAzureApi(
      `${AZURE_API_BASE}/subscriptions?api-version=${API_VERSION_SUBSCRIPTIONS}`,
      accessToken,
    )

    if (!subscriptionsResponse.ok) {
      const errorText = await subscriptionsResponse.text()
      // eslint-disable-next-line no-console
      console.error('[Azure SSO] Failed to fetch subscriptions:', errorText)
      return { resources: [], isComplete: false, error: errorText }
    }

    const subscriptionsData = await subscriptionsResponse.json()
    progress.subscriptionsTotal = subscriptionsData.value?.length || 0
    // eslint-disable-next-line no-console
    console.log('[Azure SSO] Subscriptions found:', progress.subscriptionsTotal)

    // Step 2: For each subscription, fetch both Redis and Redis Enterprise resources
    const allRedisResources: any[] = []

    for (const subscription of subscriptionsData.value || []) {
      const subName = subscription.displayName
      const subId = subscription.subscriptionId
      progress.subscriptionsCurrent++
      progress.phase = `Processing subscription: ${subName}`
      logProgress(progress)

      // Fetch standard Azure Cache for Redis (Microsoft.Cache/redis)
      const redisResponse = await fetchAzureApi(
        `${AZURE_API_BASE}/subscriptions/${subId}/providers/Microsoft.Cache/redis?api-version=${API_VERSION_REDIS}`,
        accessToken,
      )

      if (redisResponse.ok) {
        const redisData = await redisResponse.json()
        if (redisData.value?.length > 0) {
          // eslint-disable-next-line no-console
          console.log(`[Azure SSO] Found ${redisData.value.length} Standard Redis in ${subName}`)
          allRedisResources.push(
            ...redisData.value.map((redis: any) => ({
              ...redis,
              resourceType: 'Microsoft.Cache/redis',
              subscriptionName: subName,
              subscriptionId: subId,
            })),
          )
        }
      }

      // Fetch Azure Managed Redis / Redis Enterprise (Microsoft.Cache/redisEnterprise)
      const enterpriseResponse = await fetchAzureApi(
        `${AZURE_API_BASE}/subscriptions/${subId}/providers/Microsoft.Cache/redisEnterprise?api-version=${API_VERSION_REDIS_ENTERPRISE}`,
        accessToken,
      )

      if (enterpriseResponse.ok) {
        const enterpriseData = await enterpriseResponse.json()
        const clusterCount = enterpriseData.value?.length || 0

        if (clusterCount > 0) {
          // eslint-disable-next-line no-console
          console.log(`[Azure SSO] Found ${clusterCount} Redis Enterprise clusters in ${subName}`)
          progress.clustersTotal += clusterCount

          // For Redis Enterprise, we also need to fetch databases within each cluster
          for (const cluster of enterpriseData.value) {
            progress.clustersCurrent++
            progress.phase = `Fetching databases for: ${cluster.name}`

            const databasesResponse = await fetchAzureApi(
              `${AZURE_API_BASE}${cluster.id}/databases?api-version=${API_VERSION_REDIS_ENTERPRISE}`,
              accessToken,
            )

            let databases: any[] = []
            if (databasesResponse.ok) {
              const databasesData = await databasesResponse.json()
              databases = databasesData.value || []
            }

            allRedisResources.push({
              ...cluster,
              databases,
              resourceType: 'Microsoft.Cache/redisEnterprise',
              subscriptionName: subName,
              subscriptionId: subId,
            })
          }
        }
      }
    }

    // Fetching complete
    const elapsed = ((Date.now() - progress.startTime) / 1000).toFixed(1)
    // eslint-disable-next-line no-console
    console.log(`[Azure SSO] ✅ FETCH COMPLETE in ${elapsed}s`)
    // eslint-disable-next-line no-console
    console.log(`[Azure SSO] Total resources found: ${allRedisResources.length}`)

    // Log detailed summary
    // eslint-disable-next-line no-console
    console.log('[Azure SSO] === DETAILED RESOURCES SUMMARY ===')

    // Group by type
    const standardRedis = allRedisResources.filter(
      (r) => r.resourceType === 'Microsoft.Cache/redis',
    )
    const enterpriseRedis = allRedisResources.filter(
      (r) => r.resourceType === 'Microsoft.Cache/redisEnterprise',
    )

    // eslint-disable-next-line no-console
    console.log(`\n[Azure SSO] Standard Azure Cache for Redis (${standardRedis.length}):`)
    standardRedis.forEach((redis) => {
      // eslint-disable-next-line no-console
      console.log({
        name: redis.name,
        hostName: redis.properties?.hostName,
        sslPort: redis.properties?.sslPort,
        nonSslPort: redis.properties?.enableNonSslPort ? redis.properties?.port : 'disabled',
        redisVersion: redis.properties?.redisVersion,
        sku: `${redis.properties?.sku?.name} ${redis.properties?.sku?.family}${redis.properties?.sku?.capacity}`,
        location: redis.location,
        subscription: redis.subscriptionName,
      })
    })

    // eslint-disable-next-line no-console
    console.log(`\n[Azure SSO] Redis Enterprise / Azure Managed Redis (${enterpriseRedis.length}):`)
    enterpriseRedis.forEach((cluster) => {
      const isRiTeam = cluster.name === 'ri-team'

      // Special detailed logging for ri-team
      if (isRiTeam) {
        // eslint-disable-next-line no-console
        console.log('\n[Azure SSO] 🎯 === ri-team DETAILED INFO ===')
        // eslint-disable-next-line no-console
        console.log('[Azure SSO] Full cluster object:', cluster)
      }

      // eslint-disable-next-line no-console
      console.log({
        name: cluster.name,
        hostName: cluster.properties?.hostName,
        sku: `${cluster.sku?.name} (capacity: ${cluster.sku?.capacity})`,
        location: cluster.location,
        subscription: cluster.subscriptionName,
        minimumTlsVersion: cluster.properties?.minimumTlsVersion,
        databases: cluster.databases?.length || 0,
      })

      // Log each database with connection details
      cluster.databases?.forEach((db: any) => {
        const dbInfo = {
          databaseName: db.name,
          // Connection info
          endpoint: db.properties?.geoReplication?.linkedDatabases?.[0]?.id
            ? 'Geo-replicated'
            : `${cluster.properties?.hostName}:${db.properties?.port || 10000}`,
          port: db.properties?.port || 10000,
          // Auth info
          clientProtocol: db.properties?.clientProtocol, // Encrypted = TLS
          clusteringPolicy: db.properties?.clusteringPolicy, // OSSCluster or EnterpriseCluster
          evictionPolicy: db.properties?.evictionPolicy,
          // Access control
          accessKeysAuthentication: db.properties?.accessKeysAuthentication, // Enabled/Disabled
          // Modules
          modules: db.properties?.modules?.map((m: any) => m.name) || [],
          // Persistence
          persistence: db.properties?.persistence?.aofEnabled
            ? 'AOF'
            : db.properties?.persistence?.rdbEnabled
              ? 'RDB'
              : 'None',
          // State
          provisioningState: db.properties?.provisioningState,
          resourceState: db.properties?.resourceState,
        }

        if (isRiTeam) {
          // eslint-disable-next-line no-console
          console.log('[Azure SSO] 🎯 ri-team database full object:', db)
          // eslint-disable-next-line no-console
          console.log('[Azure SSO] 🎯 ri-team database parsed:', dbInfo)
        } else {
          // eslint-disable-next-line no-console
          console.log(`  └─ Database: ${db.name}`, dbInfo)
        }
      })
    })

    return { resources: allRedisResources, isComplete: true, error: null }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Azure SSO] ❌ Error fetching Azure resources:', error)
    return { resources: [], isComplete: false, error }
  }
}

const ConfigAzureSso = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    window.app?.azureSsoOauthCallback?.(azureSsoCallback)
  }, [])

  const azureSsoCallback = async (_e: any, result: AzureSsoAuthResult) => {
    // eslint-disable-next-line no-console
    console.log('[Azure SSO] Callback received:', result)

    if (result.status === 'succeed' && result.data) {
      const { upn, oid, accessToken, expiresOn } = result.data

      // Store the user data
      azureSsoStore.setUser({
        upn: upn || 'Unknown user',
        oid,
        accessToken,
        expiresOn: expiresOn.toString(),
      })

      dispatch(
        addMessageNotification({
          title: 'Azure SSO Login Successful',
          message: `Logged in as ${upn}. Fetching Redis resources...`,
        }),
      )

      // Fetch Azure Redis resources
      const fetchResult = await fetchAzureRedisResources(accessToken)

      if (fetchResult?.isComplete) {
        dispatch(
          addMessageNotification({
            title: 'Azure Resources Loaded',
            message: `Found ${fetchResult.resources.length} Redis resources. Check console for details.`,
          }),
        )

        // TEST: Try to get connection details for ri-team
        const riTeam = fetchResult.resources.find((r: any) => r.name === 'ri-team')
        if (riTeam && riTeam.databases?.length > 0) {
          // eslint-disable-next-line no-console
          console.log('[Azure SSO] 🧪 TEST: Getting connection details for ri-team...')
          const connectionDetails = await getAzureRedisConnectionDetails(
            riTeam,
            riTeam.databases[0], // default database
            accessToken,
          )
          // eslint-disable-next-line no-console
          console.log('[Azure SSO] 🧪 TEST: ri-team connection details:', connectionDetails)
        }
      } else {
        dispatch(
          addErrorNotification({
            response: {
              data: {
                message: 'Failed to fetch some Azure resources. Check console for details.',
              },
            },
          } as any),
        )
      }
    }

    if (result.status === 'failed') {
      dispatch(
        addErrorNotification({
          response: {
            data: {
              message: result.message || 'Azure SSO login failed',
            },
          },
        } as any),
      )
    }
  }

  return null
}

export default ConfigAzureSso

