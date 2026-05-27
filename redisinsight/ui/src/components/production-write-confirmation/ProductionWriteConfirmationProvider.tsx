import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useSelector } from 'react-redux'
import { Environment } from 'apiClient'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import TypeToConfirmModal from 'uiSrc/components/type-to-confirm-modal'
import { useDatabaseEnvironment } from 'uiSrc/components/hooks/useDatabaseEnvironment'
import {
  ProductionWriteConfirmationContextValue,
  ProductionWriteConfirmationRequest,
} from './ProductionWriteConfirmationProvider.types'

const ProductionWriteConfirmationContext =
  createContext<ProductionWriteConfirmationContextValue | null>(null)

const fallbackValue: ProductionWriteConfirmationContextValue = {
  requestConfirmation: ({ onConfirm }) => onConfirm(),
}

export const useProductionWriteConfirmation =
  (): ProductionWriteConfirmationContextValue =>
    useContext(ProductionWriteConfirmationContext) ?? fallbackValue

interface Props {
  children: React.ReactNode
}

export const ProductionWriteConfirmationProvider = ({ children }: Props) => {
  const { environment } = useDatabaseEnvironment()
  const { name, host, port } = useSelector(connectedInstanceSelector)
  const [pending, setPending] =
    useState<ProductionWriteConfirmationRequest | null>(null)

  // Fall back to host:port when name is empty so the modal never matches
  // an empty input (which would bypass the type-to-confirm safety check).
  const confirmationText = name || `${host}:${port}`

  const requestConfirmation = useCallback(
    (confirmation: ProductionWriteConfirmationRequest) => {
      if (environment === Environment.Production) {
        setPending(confirmation)
        return
      }
      confirmation.onConfirm()
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
          onConfirm={() => {
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
