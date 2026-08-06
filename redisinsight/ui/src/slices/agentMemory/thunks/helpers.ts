import { RootState } from '../../store'

/**
 * Thunks cannot cancel their in-flight requests when the user navigates
 * to another endpoint (resetWorkspace only resets state), so every
 * response is checked against the endpoint the inspector is currently
 * bound to and dropped when it no longer matches.
 */
export const isStaleResponse = (
  state: RootState,
  endpointId: string,
): boolean => state.agentMemory.workspace.endpointId !== endpointId

export const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
