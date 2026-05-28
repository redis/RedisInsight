import React from 'react'

export interface ProductionWriteConfirmationRequest {
  title?: React.ReactNode
  actionDescription: React.ReactNode
  confirmButtonText?: string
  cancelButtonText?: string
  onConfirm: () => void
  onCancel?: () => void
  /**
   * When provided, the user can opt to skip future confirmations for this
   * command id (or set of ids) for the rest of the session (until the
   * connected database changes or the app is reopened).
   *
   * When an array is passed (e.g. multiple dangerous commands run together
   * in Workbench), the modal is skipped only when *every* id has previously
   * been opted out, and opting in adds *every* id to the skip set.
   */
  commandId?: string | string[]
}

export interface ProductionWriteConfirmationContextValue {
  requestConfirmation: (
    confirmation: ProductionWriteConfirmationRequest,
  ) => void
}

export interface ProductionWriteConfirmationProviderProps {
  children: React.ReactNode
}
