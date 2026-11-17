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
import { useTranslation } from 'uiSrc/i18n'

import { AzureSignInDialogProps } from './AzureSignInDialog.types'
import * as S from './AzureSignInDialog.styles'

const TEST_ID = 'azure-sign-in-dialog'

// A tenant is either a GUID or a domain (e.g. your-tenant.onmicrosoft.com).
// Mirrors AZURE_TENANT_ID_REGEX on the backend.
const AZURE_TENANT_ID_REGEX =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,})$/i

export const AzureSignInDialog = ({
  isOpen,
  loading,
  onClose,
  onSignIn,
}: AzureSignInDialogProps) => {
  const { t } = useTranslation()
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
            {t('autodiscover.azure.signIn.title')}
          </Modal.Content.Header.Title>
        </Modal.Content.Header.Compose>

        <Spacer size="l" />

        <Col gap="l" data-testid={`${TEST_ID}-body`}>
          <Text color="secondary">
            {t('autodiscover.azure.signIn.description')}
          </Text>

          <Spacer size="xxl" />

          <FormField
            label={t('autodiscover.azure.signIn.tenantLabel')}
            infoIconProps={{
              content: t('autodiscover.azure.signIn.tenantInfo'),
            }}
          >
            <TextInput
              value={tenantId}
              onChange={setTenantId}
              placeholder={t('autodiscover.azure.signIn.tenantPlaceholder')}
              name="tenantId"
              data-testid={`${TEST_ID}-tenant-input`}
            />
            <Spacer size="s" />
            <Text size="S" color={isTenantInvalid ? 'danger' : 'secondary'}>
              {isTenantInvalid
                ? t('autodiscover.azure.signIn.tenantError')
                : t('autodiscover.azure.signIn.tenantHint')}
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
            {t('autodiscover.azure.button.cancel')}
          </SecondaryButton>
          <PrimaryButton
            size="large"
            loading={loading}
            disabled={loading || isTenantInvalid}
            onClick={handleSignIn}
            data-testid={`${TEST_ID}-sign-in`}
          >
            {t('autodiscover.azure.signIn.signInButton')}
          </PrimaryButton>
        </Row>
      </S.ModalContent>
    </Modal.Compose>
  )
}

export default AzureSignInDialog
