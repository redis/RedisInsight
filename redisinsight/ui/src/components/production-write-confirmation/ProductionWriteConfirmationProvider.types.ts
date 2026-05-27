import React from 'react'

export interface ProductionWriteConfirmationRequest {
  title?: React.ReactNode
  actionDescription: React.ReactNode
  confirmButtonText?: string
  cancelButtonText?: string
  onConfirm: () => void
  onCancel?: () => void
}

export interface ProductionWriteConfirmationContextValue {
  requestConfirmation: (
    confirmation: ProductionWriteConfirmationRequest,
  ) => void
}
