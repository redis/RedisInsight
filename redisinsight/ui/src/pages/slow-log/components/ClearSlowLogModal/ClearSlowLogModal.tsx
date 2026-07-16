import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { Button, DestructiveButton } from 'uiSrc/components/base/forms/buttons'
import { Col, FlexGroup, Row } from 'uiSrc/components/base/layout/flex'
import { Title, Text } from 'uiSrc/components/base/text'
import { EraserIcon } from 'uiSrc/components/base/icons'
import { Spacer } from 'uiSrc/components/base/layout'

import { StyledFormDialog } from './ClearSlowLogModal.styles'

export interface ClearSlowLogModalProps {
  name: string
  isOpen: boolean
  onClose: () => void
  onClear: () => void
}

export const ClearSlowLogModal = ({
  name,
  isOpen,
  onClose,
  onClear,
}: ClearSlowLogModalProps) => {
  const { t } = useTranslation()

  const handleClearClick = () => {
    onClear()
    onClose()
  }

  return (
    <StyledFormDialog
      isOpen={isOpen}
      onClose={onClose}
      data-testid="clear-slow-log-modal"
      header={
        <Title size="XL">{t('analytics.slowLog.clearModal.title')}</Title>
      }
      footer={
        <Row justify="end" gap="m">
          <Button
            variant="secondary-ghost"
            size="large"
            onClick={onClose}
            data-testid="reset-cancel-btn"
          >
            {t('analytics.slowLog.clearModal.button.cancel')}
          </Button>
          <DestructiveButton
            size="large"
            icon={EraserIcon}
            onClick={() => handleClearClick()}
            data-testid="reset-confirm-btn"
          >
            {t('analytics.slowLog.clearModal.button.clear')}
          </DestructiveButton>
        </Row>
      }
    >
      <Spacer size="l" />
      <FlexGroup direction="column" gap="l">
        <Col>
          <Text size="m" color="primary">
            {t('analytics.slowLog.clearModal.message', { name })}
          </Text>
          <Text size="m" color="secondary">
            {t('analytics.slowLog.clearModal.note')}
          </Text>
        </Col>
      </FlexGroup>
    </StyledFormDialog>
  )
}
