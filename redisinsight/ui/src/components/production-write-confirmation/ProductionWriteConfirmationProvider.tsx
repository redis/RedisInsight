import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useSelector } from 'react-redux'
import { Environment } from 'apiClient'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import TypeToConfirmModal from 'uiSrc/components/type-to-confirm-modal'
import { useDatabaseEnvironment } from 'uiSrc/components/hooks/useDatabaseEnvironment'
import {
  ProductionWriteConfirmationContextValue,
  ProductionWriteConfirmationProviderProps,
  ProductionWriteConfirmationRequest,
} from './ProductionWriteConfirmationProvider.types'
import { toCommandIdArray } from './ProductionWriteConfirmationProvider.utils'

const ProductionWriteConfirmationContext =
  createContext<ProductionWriteConfirmationContextValue | null>(null)

const fallbackValue: ProductionWriteConfirmationContextValue = {
  requestConfirmation: ({ onConfirm }) => onConfirm(),
}

export const useProductionWriteConfirmation =
  (): ProductionWriteConfirmationContextValue =>
    useContext(ProductionWriteConfirmationContext) ?? fallbackValue

export const ProductionWriteConfirmationProvider = ({
  children,
}: ProductionWriteConfirmationProviderProps) => {
  const { environment } = useDatabaseEnvironment()
  const { id, name, host, port } = useSelector(connectedInstanceSelector)
  const [pending, setPending] =
    useState<ProductionWriteConfirmationRequest | null>(null)
  const skippedCommandsRef = useRef<Set<string>>(new Set())

  // Reset the per-session skip list whenever the connected database changes
  // so opting out of a confirmation never leaks across databases.
  useEffect(() => {
    skippedCommandsRef.current = new Set()
  }, [id])

  // Fall back to host:port when name is empty so the modal never matches
  // an empty input (which would bypass the type-to-confirm safety check).
  const confirmationText = name || `${host}:${port}`

  const requestConfirmation = useCallback(
    (confirmation: ProductionWriteConfirmationRequest) => {
      if (environment !== Environment.Production) {
        confirmation.onConfirm()
        return
      }
      const commandIds = toCommandIdArray(confirmation.commandId)
      if (
        commandIds.length > 0 &&
        commandIds.every((id) => skippedCommandsRef.current.has(id))
      ) {
        confirmation.onConfirm()
        return
      }
      setPending(confirmation)
    },
    [environment],
  )

  const value = useMemo(() => ({ requestConfirmation }), [requestConfirmation])

  return (
    <ProductionWriteConfirmationContext.Provider value={value}>
      {children}
      {pending && (
        <TypeToConfirmModal
          confirmationText={confirmationText}
          title={pending.title}
          actionDescription={pending.actionDescription}
          confirmButtonText={pending.confirmButtonText}
          cancelButtonText={pending.cancelButtonText}
          showSkipForSession={toCommandIdArray(pending.commandId).length > 0}
          onConfirm={(skipForSession) => {
            if (skipForSession) {
              toCommandIdArray(pending.commandId).forEach((id) =>
                skippedCommandsRef.current.add(id),
              )
            }
            pending.onConfirm()
            setPending(null)
          }}
          onCancel={() => {
            pending.onCancel?.()
            setPending(null)
          }}
        />
      )}
    </ProductionWriteConfirmationContext.Provider>
  )
}
