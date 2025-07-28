import React from 'react'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { PrimaryButton, SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import AddKeyFooter from 'uiSrc/pages/browser/components/add-key/AddKeyFooter/AddKeyFooter'
import { SpacerSize } from 'uiSrc/components/base/layout/spacer/spacer.styles'

export interface ActionFooterProps {
  cancelText?: string
  actionText?: string
  onCancel: () => void
  onAction: () => void
  disabled?: boolean
  loading?: boolean
  gap?: SpacerSize
  actionTestId?: string
  cancelTestId?: string
  usePortal?: boolean
  enableFormSubmit?: boolean
}

export const ActionFooter = ({
  cancelText = 'Cancel',
  actionText = 'Save',
  onCancel,
  onAction,
  disabled = false,
  loading = false,
  gap = "m",
  actionTestId,
  cancelTestId,  
  usePortal = true,
  enableFormSubmit = true,
}: ActionFooterProps) => {
  const content = (
    <Row justify="end" gap={gap} style={{ padding: 18 }}>
      <FlexItem>
        <SecondaryButton
          onClick={onCancel}
          data-testid={cancelTestId}
        >
          {cancelText}
        </SecondaryButton>
      </FlexItem>
      <FlexItem>
        <PrimaryButton
          type={enableFormSubmit ? 'submit' : 'button'}
          loading={loading}
          onClick={onAction}
          disabled={disabled || loading}
          data-testid={actionTestId}
        >
          {actionText}
        </PrimaryButton>
      </FlexItem>
    </Row>
  )

  if (enableFormSubmit) {
    return (
      <>
        <PrimaryButton type="submit" style={{ display: 'none' }}>
          Submit
        </PrimaryButton>
        {usePortal ? <AddKeyFooter>{content}</AddKeyFooter> : content}
      </>
    )
  }

  if (usePortal) {
    return <AddKeyFooter>{content}</AddKeyFooter>
  }

  return content
} 