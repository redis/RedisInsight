import React from 'react'

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
  const handleClearClick = () => {
    onClear()
    onClose()
  }

  return (
    <StyledFormDialog
      isOpen={isOpen}
      onClose={onClose}
      data-testid="clear-slow-log-modal"
      header={<Title size="XL">Clear slow log</Title>}
      footer={
        <Row justify="end" gap="m">
          <Button
            variant="secondary-ghost"
            size="large"
            onClick={onClose}
            data-testid="reset-cancel-btn"
          >
            Cancel
          </Button>
          <DestructiveButton
            size="large"
            icon={EraserIcon}
            onClick={() => handleClearClick()}
            data-testid="reset-confirm-btn"
          >
            Clear
          </DestructiveButton>
        </Row>
      }
    >
      <Spacer size="l" />
      <FlexGroup direction="column" gap="l">
        <Col>
          <Text size="m" color="primary">
            Slow Log will be cleared for&nbsp;{name}
          </Text>
          <Text size="m" color="secondary">
            NOTE: This is server configuration
          </Text>
        </Col>
      </FlexGroup>
    </StyledFormDialog>
  )
}
