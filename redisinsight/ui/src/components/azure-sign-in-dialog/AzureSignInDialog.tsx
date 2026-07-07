import React, { useCallback, useEffect, useState } from 'react'

import { Modal } from 'uiSrc/components/base/display'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout'
import { Text } from 'uiSrc/components/base/text'
import TextInput from 'uiSrc/components/base/inputs/TextInput'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import {
  EmptyButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'

import { AzureSignInDialogProps } from './AzureSignInDialog.types'
import * as S from './AzureSignInDialog.styles'

const TEST_ID = 'azure-sign-in-dialog'

// A tenant is either a GUID or a domain (e.g. contoso.onmicrosoft.com).
// Mirrors AZURE_TENANT_ID_REGEX on the backend.
const AZURE_TENANT_ID_REGEX =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,})$/i

const TENANT_ID_ERROR = 'Enter a valid tenant GUID or domain.'

export const AzureSignInDialog = ({
  isOpen,
  loading,
  onClose,
  onSignIn,
}: AzureSignInDialogProps) => {
  const [tenantId, setTenantId] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTenantId('')
      setShowAdvanced(false)
    }
  }, [isOpen])

  const trimmedTenant = tenantId.trim()
  const isTenantInvalid =
    trimmedTenant.length > 0 && !AZURE_TENANT_ID_REGEX.test(trimmedTenant)

  const handleSignIn = useCallback(() => {
    if (isTenantInvalid) return
    onSignIn(trimmedTenant || undefined)
  }, [isTenantInvalid, trimmedTenant, onSignIn])

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
          <Modal.Content.Header.Title>
            Connect to Azure Managed Redis
          </Modal.Content.Header.Title>
        </Modal.Content.Header.Compose>

        <Col gap="l" data-testid={`${TEST_ID}-body`}>
          <Text color="secondary">
            Sign in with your Microsoft account to discover and add Azure
            Managed Redis databases.
          </Text>

          <EmptyButton
            variant="primary-inline"
            onClick={() => setShowAdvanced((v) => !v)}
            data-testid={`${TEST_ID}-toggle-advanced`}
          >
            {showAdvanced ? 'Hide advanced options' : 'Advanced options'}
          </EmptyButton>

          {showAdvanced && (
            <FormField label="Tenant ID (optional)">
              <TextInput
                value={tenantId}
                onChange={setTenantId}
                placeholder="contoso.onmicrosoft.com or GUID"
                name="tenantId"
                data-testid={`${TEST_ID}-tenant-input`}
              />
              <Spacer size="s" />
              <Text size="S" color={isTenantInvalid ? 'danger' : 'secondary'}>
                {isTenantInvalid
                  ? TENANT_ID_ERROR
                  : 'Use this if your Azure resources live in a different tenant than your account.'}
              </Text>
            </FormField>
          )}
        </Col>

        <Spacer size="l" />

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
            loading={loading}
            disabled={loading || isTenantInvalid}
            onClick={handleSignIn}
            data-testid={`${TEST_ID}-sign-in`}
          >
            Sign in with Microsoft
          </PrimaryButton>
        </Row>
      </S.ModalContent>
    </Modal.Compose>
  )
}

export default AzureSignInDialog
