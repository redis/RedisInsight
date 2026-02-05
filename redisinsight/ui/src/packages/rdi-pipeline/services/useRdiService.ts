import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RdiService, RdiInstance } from '@rdi-ui-poc/rdi-ui-pipeline'
import { instancesSelector } from 'uiSrc/slices/rdi/instances'

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
        }
      },
    }),
    [instances, connectedInstance],
  )
}
