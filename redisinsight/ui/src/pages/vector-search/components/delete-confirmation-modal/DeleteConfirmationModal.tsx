import React from 'react'

import { Modal } from 'uiSrc/components/base/display'
import { Text } from 'uiSrc/components/base/text'
import {
  SecondaryButton,
  DestructiveButton,
} from 'uiSrc/components/base/forms/buttons'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

import { DeleteConfirmationModalProps } from './DeleteConfirmationModal.types'
import * as S from './DeleteConfirmationModal.styles'

const DEFAULT_TEST_ID = 'delete-confirmation-modal'

export const DeleteConfirmationModal = ({
  isOpen,
  title,
  question,
  message,
  cancelLabel,
  confirmLabel,
  onConfirm,
  onCancel,
  testId = DEFAULT_TEST_ID,
}: DeleteConfirmationModalProps) => {
  if (!isOpen) return null

  return (
    <Modal.Compose open={isOpen}>
      <S.ModalContent persistent onCancel={onCancel}>
        <Modal.Content.Close
          icon={CancelIcon}
          onClick={onCancel}
          data-testid={`${testId}-close`}
        />

        <Modal.Content.Header.Compose>
          <Modal.Content.Header.Title>{title}</Modal.Content.Header.Title>
        </Modal.Content.Header.Compose>

        <Col gap="m" data-testid={`${testId}-message`}>
          <Text color="secondary">{question}</Text>
          <Text color="primary" variant="semiBold">
            {message}
          </Text>
          <Spacer size="xl" />
        </Col>

        <Row justify="end" gap="m">
          <SecondaryButton
            size="large"
            onClick={onCancel}
            data-testid={`${testId}-cancel`}
          >
            {cancelLabel}
          </SecondaryButton>
          <DestructiveButton
            size="large"
            onClick={onConfirm}
            data-testid={`${testId}-confirm`}
          >
            {confirmLabel}
          </DestructiveButton>
        </Row>
      </S.ModalContent>
    </Modal.Compose>
  )
}
