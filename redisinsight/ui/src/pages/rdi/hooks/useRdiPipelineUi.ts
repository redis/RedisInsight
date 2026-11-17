import { useMemo } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { isDevRdiUiEnabledSelector } from 'uiSrc/slices/app/features'
import { shouldUseRdiUiPipeline } from 'uiSrc/utils/rdi'
import { useConnectRdiInstance } from './useConnectRdiInstance'

export type RdiPipelineUiState =
  { status: 'loading' } | { status: 'ready'; target: 'v1' | 'v2' }

export const useRdiPipelineUi = (rdiInstanceId: string): RdiPipelineUiState => {
  const { connectedInstance, contextRdiInstanceId } =
    useConnectRdiInstance(rdiInstanceId)
  const isDevRdiUiEnabled = useAppSelector(isDevRdiUiEnabledSelector)

  return useMemo<RdiPipelineUiState>(() => {
    if (contextRdiInstanceId !== rdiInstanceId) {
      return { status: 'loading' }
    }

    if (connectedInstance.id === rdiInstanceId) {
      const target = shouldUseRdiUiPipeline(
        connectedInstance.version ?? '',
        isDevRdiUiEnabled,
      )
        ? 'v2'
        : 'v1'
      return { status: 'ready', target }
    }

    if (!connectedInstance.loading && connectedInstance.error) {
      return { status: 'ready', target: 'v1' }
    }

    return { status: 'loading' }
  }, [
    rdiInstanceId,
    contextRdiInstanceId,
    connectedInstance.id,
    connectedInstance.version,
    connectedInstance.loading,
    connectedInstance.error,
    isDevRdiUiEnabled,
  ])
}
