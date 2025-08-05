import React from 'react'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiPrimaryButton, RiSecondaryButton } from 'uiSrc/components/base/forms'
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
  cancelClassName?: string
  actionClassName?: string
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
  gap = 'm',
  actionTestId,
  cancelTestId,
  cancelClassName = 'btn-cancel btn-back',
  actionClassName = 'btn-add',
  usePortal = true,
  enableFormSubmit = true,
}: ActionFooterProps) => {
  const content = (
    <RiRow justify="end" gap={gap} style={{ padding: 18 }}>
      <RiFlexItem>
        <RiSecondaryButton
          onClick={onCancel}
          data-testid={cancelTestId}
          className={cancelClassName}
        >
          {cancelText}
        </RiSecondaryButton>
      </RiFlexItem>
      <RiFlexItem>
        <RiPrimaryButton
          type={enableFormSubmit ? 'submit' : 'button'}
          loading={loading}
          onClick={onAction}
          disabled={disabled || loading}
          data-testid={actionTestId}
          className={actionClassName}
        >
          {actionText}
        </RiPrimaryButton>
      </RiFlexItem>
    </RiRow>
  )

  if (enableFormSubmit) {
    return (
      <>
        <RiPrimaryButton type="submit" style={{ display: 'none' }}>
          Submit
        </RiPrimaryButton>
        {usePortal ? <AddKeyFooter>{content}</AddKeyFooter> : content}
      </>
    )
  }

  if (usePortal) {
    return <AddKeyFooter>{content}</AddKeyFooter>
  }

  return content
}
