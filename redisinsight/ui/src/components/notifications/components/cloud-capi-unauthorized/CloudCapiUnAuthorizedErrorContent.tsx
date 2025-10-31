import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { ColorText } from 'uiSrc/components/base/text'
import { removeCapiKeyAction } from 'uiSrc/slices/oauth/cloud'
import { Pages } from 'uiSrc/constants'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  DestructiveButton,
  EmptyButton,
} from 'uiSrc/components/base/forms/buttons'

export interface Props {
  resourceId: string
  text: string | JSX.Element | JSX.Element[]
  onClose?: () => void
}

const CloudCapiUnAuthorizedErrorContent = ({
  text,
  onClose = () => {},
  resourceId,
}: Props) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const handleRemoveCapi = () => {
    dispatch(
      removeCapiKeyAction({ id: resourceId, name: 'Api Key' }, () => {
        sendEventTelemetry({
          event: TelemetryEvent.CLOUD_API_KEY_REMOVED,
          eventData: {
            source: OAuthSocialSource.ConfirmationMessage,
          },
        })
      }),
    )
    onClose?.()
  }

  const handleGoToSettings = () => {
    history.push(`${Pages.settings}#cloud`)
    onClose?.()
  }

  return (
    <>
      <ColorText color="danger">{text}</ColorText>
      <Spacer />
      <Row justify="end">
        <FlexItem>
          <EmptyButton
            variant="destructive"
            size="small"
            onClick={handleGoToSettings}
            className="toast-danger-btn euiBorderWidthThick"
            data-testid="go-to-settings-btn"
          >
            Go to Settings
          </EmptyButton>
        </FlexItem>
        <FlexItem>
          <DestructiveButton
            size="s"
            onClick={handleRemoveCapi}
            className="toast-danger-btn"
            data-testid="remove-api-key-btn"
          >
            Remove API key
          </DestructiveButton>
        </FlexItem>
      </Row>
    </>
  )
}

export default CloudCapiUnAuthorizedErrorContent
