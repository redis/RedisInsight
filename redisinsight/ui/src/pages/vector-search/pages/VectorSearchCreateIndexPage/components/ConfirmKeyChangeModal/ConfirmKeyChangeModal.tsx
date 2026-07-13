import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { Modal } from 'uiSrc/components/base/display'
import { Button, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

import { ConfirmKeyChangeModalProps } from './ConfirmKeyChangeModal.types'
import * as S from './ConfirmKeyChangeModal.styles'

export const ConfirmKeyChangeModal = ({
  onConfirm,
  onCancel,
}: ConfirmKeyChangeModalProps) => {
  const { t } = useTranslation()

  return (
    <Modal.Compose open>
      <S.ConfirmModalContent persistent onCancel={onCancel}>
        <Modal.Content.Close
          icon={CancelIcon}
          onClick={onCancel}
          data-testid="change-key-modal-close"
        />

        <Modal.Content.Header.Compose>
          <Modal.Content.Header.Title>
            {t('vectorSearch.createIndex.confirmKeyChange.title')}
          </Modal.Content.Header.Title>
        </Modal.Content.Header.Compose>

        <Col gap="m">
          <Text color="secondary" data-testid="change-key-modal-message">
            {t('vectorSearch.createIndex.confirmKeyChange.body')}
          </Text>
          <Spacer size="xl" />
        </Col>

        <Row justify="end" gap="m">
          <Button
            size="large"
            variant="secondary-ghost"
            onClick={onCancel}
            data-testid="change-key-modal-cancel"
          >
            {t('vectorSearch.createIndex.confirmKeyChange.keepEditing')}
          </Button>
          <PrimaryButton
            size="large"
            onClick={onConfirm}
            data-testid="change-key-modal-confirm"
          >
            {t('vectorSearch.createIndex.confirmKeyChange.discardAndLoad')}
          </PrimaryButton>
        </Row>
      </S.ConfirmModalContent>
    </Modal.Compose>
  )
}
