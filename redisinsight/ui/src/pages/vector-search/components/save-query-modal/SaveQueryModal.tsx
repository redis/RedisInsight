import React, { useCallback, useEffect, useState } from 'react'

import { Modal } from 'uiSrc/components/base/display'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout'
import { Text } from 'uiSrc/components/base/text'
import TextInput from 'uiSrc/components/base/inputs/TextInput'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'

import { SaveQueryModalProps } from './SaveQueryModal.types'
import * as S from './SaveQueryModal.styles'

const TEST_ID = 'save-query-modal'

export const SaveQueryModal = ({
  isOpen,
  isSaving,
  onSave,
  onClose,
}: SaveQueryModalProps) => {
  const [name, setName] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName('')
    }
  }, [isOpen])

  const isSaveDisabled = !name.trim() || isSaving

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(trimmed)
  }, [name, onSave])

  if (!isOpen) return null

  return (
    <Modal.Compose open={isOpen}>
      <S.ModalContent persistent onCancel={onClose}>
        <Modal.Content.Close
          icon={CancelIcon}
          onClick={onClose}
          data-testid={`${TEST_ID}-close`}
        />

        <Modal.Content.Header.Compose>
          <Modal.Content.Header.Title>Save query</Modal.Content.Header.Title>
        </Modal.Content.Header.Compose>

        <Col gap="l" data-testid={`${TEST_ID}-body`}>
          <Text color="secondary">
            Name your query to add it to your saved queries list for quick
            reuse.
          </Text>

          <TextInput
            value={name}
            onChange={setName}
            placeholder="Enter command name"
            name="queryName"
            autoFocus
            data-testid={`${TEST_ID}-name-input`}
          />
          <Spacer size="s" />
        </Col>

        <Row justify="end" gap="m">
          <SecondaryButton
            size="large"
            onClick={onClose}
            data-testid={`${TEST_ID}-cancel`}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            size="large"
            loading={isSaving}
            onClick={handleSubmit}
            disabled={isSaveDisabled}
            data-testid={`${TEST_ID}-confirm`}
          >
            Save query
          </PrimaryButton>
        </Row>
      </S.ModalContent>
    </Modal.Compose>
  )
}
