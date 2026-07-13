import React, { useCallback, useEffect, useState } from 'react'

import { Modal } from 'uiSrc/components/base/display'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout'
import { Text } from 'uiSrc/components/base/text'
import TextInput from 'uiSrc/components/base/inputs/TextInput'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'

import { AzureSignInDialogProps } from './AzureSignInDialog.types'
import * as S from './AzureSignInDialog.styles'

const TEST_ID = 'azure-sign-in-dialog'

// A tenant is either a GUID or a domain (e.g. your-tenant.onmicrosoft.com).
// Mirrors AZURE_TENANT_ID_REGEX on the backend.
const AZURE_TENANT_ID_REGEX =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,})$/i

const TENANT_ID_ERROR = 'Enter a valid tenant GUID or domain.'

const TENANT_ID_HINT =
  'Only needed if your resources and your account are in different tenants.'

// Explains the cross-tenant case: authenticate against the tenant that OWNS the
// resources, not the user's home tenant.
const TENANT_ID_INFO =
  "Leave blank to use your account's default (home) tenant. " +
  'If your Azure Managed Redis resources are in a different tenant than your ' +
  'account, enter the tenant that owns the resources (you need guest access ' +
  'to it) — not your own home tenant.'

export const AzureSignInDialog = ({
  isOpen,
  loading,
  onClose,
  onSignIn,
}: AzureSignInDialogProps) => {
  const [tenantId, setTenantId] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTenantId('')
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

          <FormField
            label="Tenant ID (optional)"
            infoIconProps={{ content: TENANT_ID_INFO }}
          >
            <TextInput
              value={tenantId}
              onChange={setTenantId}
              placeholder="your-tenant.onmicrosoft.com or GUID"
              name="tenantId"
              data-testid={`${TEST_ID}-tenant-input`}
            />
            <Spacer size="s" />
            <Text size="S" color={isTenantInvalid ? 'danger' : 'secondary'}>
              {isTenantInvalid ? TENANT_ID_ERROR : TENANT_ID_HINT}
            </Text>
          </FormField>
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
