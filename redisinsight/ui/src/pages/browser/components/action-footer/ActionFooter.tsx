import React from 'react'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import AddKeyFooter from 'uiSrc/pages/browser/components/add-key/AddKeyFooter/AddKeyFooter'
import { SpacerSize } from 'uiSrc/components/base/layout/spacer/spacer.styles'
import { Panel } from 'uiSrc/components/panel'

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
    <Panel justify="end" gap={gap}>
      <FlexItem>
        <SecondaryButton
          onClick={onCancel}
          data-testid={cancelTestId}
          className={cancelClassName}
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
          className={actionClassName}
        >
          {actionText}
        </PrimaryButton>
      </FlexItem>
    </Panel>
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
