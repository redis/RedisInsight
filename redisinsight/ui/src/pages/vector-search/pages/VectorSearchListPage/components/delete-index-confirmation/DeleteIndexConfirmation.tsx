import React from 'react'

import { Modal } from 'uiSrc/components/base/display'
import { Button, DestructiveButton } from 'uiSrc/components/base/forms/buttons'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'

import * as S from './DeleteIndexConfirmation.styles'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

export interface DeleteIndexConfirmationProps {
  isOpen: boolean
  onConfirm: () => void
  onClose: () => void
}

export const DeleteIndexConfirmation = ({
  isOpen,
  onConfirm,
  onClose,
}: DeleteIndexConfirmationProps) => {
  if (!isOpen) return null

  return (
    <Modal.Compose open={isOpen}>
      <S.ModalContent persistent onCancel={onClose}>
        <Modal.Content.Close
          icon={CancelIcon}
          onClick={onClose}
          data-testid="delete-index-modal-close"
        />

        <Modal.Content.Header.Compose>
          <Modal.Content.Header.Title>Delete Index</Modal.Content.Header.Title>
        </Modal.Content.Header.Compose>

        <Col gap="m">
          <S.Question data-testid="delete-index-modal-question">
            Are you sure you want to delete this index?
          </S.Question>
          <Text
            color="primary"
            variant="semiBold"
            data-testid="delete-index-modal-message"
          >
            Deleting the index will remove it from Search and Vector Search, but
            will not delete your underlying data.
          </Text>
          <Spacer size="xl" />
        </Col>

        <Row justify="end" gap="m">
          <Button
            size="large"
            variant="secondary-ghost"
            onClick={onClose}
            data-testid="delete-index-modal-cancel"
          >
            Keep index
          </Button>
          <DestructiveButton
            size="large"
            onClick={onConfirm}
            data-testid="delete-index-modal-confirm"
          >
            Delete index
          </DestructiveButton>
        </Row>
      </S.ModalContent>
    </Modal.Compose>
  )
}
