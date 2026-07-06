import React from 'react'
import { useTranslation } from 'uiSrc/i18n'
import { ColorText } from 'uiSrc/components/base/text'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Button } from 'uiSrc/components/base/forms/buttons'
import { useAzureAuth } from 'uiSrc/components/hooks/useAzureAuth'
import { AzureLoginSource } from 'uiSrc/slices/interfaces'

export interface Props {
  text: string | JSX.Element | JSX.Element[]
  onClose?: () => void
}

const AzureTokenExpiredErrorContent = ({ text, onClose = () => {} }: Props) => {
  const { initiateLogin, loading } = useAzureAuth()
  const { t } = useTranslation()

  const handleSignIn = () => {
    initiateLogin(AzureLoginSource.TokenRefresh)
    onClose?.()
  }

  return (
    <>
      <ColorText color="informative">{text}</ColorText>
      <Spacer />
      <Row justify="end">
        <FlexItem>
          <Button
            size="s"
            onClick={handleSignIn}
            loading={loading}
            data-testid="azure-sign-in-btn"
          >
            {t('api.error.code.11024.button.signIn')}
          </Button>
        </FlexItem>
      </Row>
    </>
  )
}

export default AzureTokenExpiredErrorContent
