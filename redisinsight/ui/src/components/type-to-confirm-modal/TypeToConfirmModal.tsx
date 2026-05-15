import React, { useState } from 'react'

import { Modal } from 'uiSrc/components/base/display'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import {
  DestructiveButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextInput } from 'uiSrc/components/base/inputs'
import { Text } from 'uiSrc/components/base/text'

export interface Props {
  confirmationText: string
  actionDescription: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
  title?: React.ReactNode
  confirmButtonText?: string
  cancelButtonText?: string
}

const TypeToConfirmModal = ({
  confirmationText,
  actionDescription,
  onConfirm,
  onCancel,
  title = 'Confirm action',
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
}: Props) => {
  const [value, setValue] = useState('')
  const isMatch = value === confirmationText

  const handleConfirm = () => {
    if (!isMatch) return
    onConfirm()
  }

  return (
    <Modal.Compose open>
      <Modal.Content.Compose persistent onCancel={onCancel}>
        <Modal.Content.Close
          icon={CancelIcon}
          onClick={onCancel}
          data-testid="type-to-confirm-modal-close-btn"
        />

        <Modal.Content.Header.Compose>
          <Modal.Content.Header.Title data-testid="type-to-confirm-modal-title">
            {title}
          </Modal.Content.Header.Title>
        </Modal.Content.Header.Compose>

        <Modal.Content.Body
          content={
            <Col gap="l">
              <Text data-testid="type-to-confirm-modal-description">
                {actionDescription}
              </Text>
              <FormField
                label={
                  <span>
                    Type <strong>{confirmationText}</strong> to confirm
                  </span>
                }
              >
                <TextInput
                  autoFocus={false}
                  value={value}
                  onChange={setValue}
                  autoComplete="off"
                  spellCheck={false}
                  data-testid="type-to-confirm-modal-input"
                />
              </FormField>
            </Col>
          }
        />

        <Modal.Content.Footer.Compose>
          <Modal.Content.Footer.Group>
            <Row gap="m" justify="end">
              <SecondaryButton
                size="l"
                autoFocus
                onClick={onCancel}
                data-testid="type-to-confirm-modal-cancel-btn"
              >
                {cancelButtonText}
              </SecondaryButton>
              <DestructiveButton
                size="l"
                onClick={handleConfirm}
                disabled={!isMatch}
                data-testid="type-to-confirm-modal-confirm-btn"
              >
                {confirmButtonText}
              </DestructiveButton>
            </Row>
          </Modal.Content.Footer.Group>
        </Modal.Content.Footer.Compose>
      </Modal.Content.Compose>
    </Modal.Compose>
  )
}

export default TypeToConfirmModal
