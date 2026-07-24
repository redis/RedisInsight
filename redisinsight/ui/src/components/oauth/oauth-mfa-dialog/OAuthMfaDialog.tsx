import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  oauthCloudMfaSelector,
  resetMfaError,
  setMfaDialogState,
  setOAuthCloudSource,
  submitMfaCodeAction,
} from 'uiSrc/slices/oauth/cloud'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'

import { Modal } from 'uiSrc/components/base/display'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { ColorText, Text } from 'uiSrc/components/base/text'

import { OAuthMfaDialogProps } from './OAuthMfaDialog.types'
import { MFA_CODE_LENGTH } from './OAuthMfaDialog.constants'
import OtpInput from './components/otp-input/OtpInput'

const OAuthMfaDialog = ({ onVerified }: OAuthMfaDialogProps) => {
  const { isOpenDialog, loading, error } = useAppSelector(oauthCloudMfaSelector)
  const [code, setCode] = useState('')

  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  useEffect(() => {
    if (!isOpenDialog) {
      setCode('')
    }
  }, [isOpenDialog])

  // clear the boxes after a rejected code so the user can retype right away
  useEffect(() => {
    if (error) {
      setCode('')
    }
  }, [error])

  if (!isOpenDialog) return null

  const isSubmitDisabled = code.length !== MFA_CODE_LENGTH || loading

  const handleCancel = () => {
    // ignore cancel while a verification is in flight, otherwise the pending
    // request could still resolve and resume the flow after the user cancelled
    if (loading) return

    dispatch(setMfaDialogState(false))
    dispatch(setOAuthCloudSource(null))
    // clearing the SSO flow releases ConfigOAuth's in-progress guard, so a
    // later failed sign-in still surfaces instead of being swallowed
    dispatch(setSSOFlow(undefined))
  }

  const handleChange = (next: string) => {
    setCode(next)
    // dismiss the previous failure as soon as the user edits the code
    if (error) {
      dispatch(resetMfaError())
    }
  }

  // accept the code explicitly so the auto-submit-on-complete path doesn't
  // race the `code` state update
  const handleSubmit = (submittedCode: string = code) => {
    if (submittedCode.length !== MFA_CODE_LENGTH || loading) return

    dispatch(submitMfaCodeAction(submittedCode, onVerified))
  }

  return (
    <Modal.Compose open>
      <Modal.Content.Compose
        persistent
        onCancel={handleCancel}
        data-testid="oauth-mfa-dialog"
      >
        <Modal.Content.Close
          icon={CancelIcon}
          onClick={handleCancel}
          data-testid="oauth-mfa-dialog-close-btn"
        />

        <Modal.Content.Header.Compose>
          <Modal.Content.Header.Title>
            {t('oauth.mfa.title')}
          </Modal.Content.Header.Title>
        </Modal.Content.Header.Compose>

        <Modal.Content.Body
          content={
            <Col gap="l">
              <Text>{t('oauth.mfa.description')}</Text>
              <OtpInput
                autoFocus
                value={code}
                onChange={handleChange}
                onComplete={handleSubmit}
                length={MFA_CODE_LENGTH}
                isInvalid={!!error}
                disabled={loading}
                ariaLabel={t('oauth.mfa.codeLabel')}
                data-testid="oauth-mfa-dialog-code-input"
              />
              {error && (
                <ColorText color="danger" data-testid="oauth-mfa-dialog-error">
                  {error}
                </ColorText>
              )}
            </Col>
          }
        />

        <Modal.Content.Footer.Compose>
          <Modal.Content.Footer.Group>
            <Row gap="m" justify="end">
              <SecondaryButton
                size="l"
                onClick={handleCancel}
                disabled={loading}
                data-testid="oauth-mfa-dialog-cancel-btn"
              >
                {t('oauth.mfa.cancel')}
              </SecondaryButton>
              <PrimaryButton
                size="l"
                onClick={() => handleSubmit()}
                disabled={isSubmitDisabled}
                loading={loading}
                data-testid="oauth-mfa-dialog-submit-btn"
              >
                {t('oauth.mfa.verify')}
              </PrimaryButton>
            </Row>
          </Modal.Content.Footer.Group>
        </Modal.Content.Footer.Compose>
      </Modal.Content.Compose>
    </Modal.Compose>
  )
}

export default OAuthMfaDialog
