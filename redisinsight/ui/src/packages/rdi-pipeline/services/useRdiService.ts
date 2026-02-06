import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RdiService, RdiInstance } from '@rdi-ui-poc/rdi-ui-pipeline'
import { instancesSelector } from 'uiSrc/slices/rdi/instances'
import { getBaseUrl } from 'uiSrc/services/apiService'

/**
 * Get the RDI proxy path that the SDK should use.
 * In development, this includes the full URL with port (e.g., http://localhost:5540/api/rdi-proxy/{id}).
 * In production, this is just the relative path (/api/rdi-proxy/{id}).
 */
const getRdiProxyPath = (instanceId: string): string => {
  // getBaseUrl() returns e.g. "http://localhost:5540/api/" in dev
  // or "/api/" in production
  const baseUrl = getBaseUrl()
  // Remove trailing slash and append rdi-proxy path
  const normalizedBase = baseUrl.replace(/\/$/, '')
  return `${normalizedBase}/rdi-proxy/${instanceId}`
}

/**
 * Creates an RdiService implementation that fetches data from Redux store.
 * This service is injected into the PipelineProvider to provide RDI instance data.
 */
export const useRdiServiceImpl = (): RdiService => {
  const { data: instances, connectedInstance } = useSelector(instancesSelector)

  return useMemo(
    () => ({
      getInstance: async (id: string): Promise<RdiInstance> => {
        // First check if it's the connected instance
        if (connectedInstance.id === id) {
          return {
            id: connectedInstance.id,
            name: connectedInstance.name,
            url: connectedInstance.url,
            version: connectedInstance.version,
            lastConnection: connectedInstance.lastConnection?.toISOString?.()
              || String(connectedInstance.lastConnection),
            // Proxy mode: SDK calls through backend proxy to RDI
            proxyPath: getRdiProxyPath(connectedInstance.id),
            // Auth credentials for SDK to login via proxy
            username: connectedInstance.username,
            password: connectedInstance.password,
          }
        }

        // Otherwise look in the instances list
        const instance = instances.find((inst) => inst.id === id)
        if (!instance) {
          throw new Error(`RDI instance not found: ${id}`)
        }

        return {
          id: instance.id,
          name: instance.name,
          url: instance.url,
          version: instance.version,
          lastConnection: instance.lastConnection?.toISOString?.()
            || String(instance.lastConnection),
          // Proxy mode: SDK calls through backend proxy to RDI
          proxyPath: getRdiProxyPath(instance.id),
          // Auth credentials for SDK to login via proxy
          username: instance.username,
          password: instance.password,
        }
      },
    }),
    [instances, connectedInstance],
  )
}
