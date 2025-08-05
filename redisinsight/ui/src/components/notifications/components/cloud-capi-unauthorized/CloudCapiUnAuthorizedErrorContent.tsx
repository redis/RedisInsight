import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { ColorText } from 'uiSrc/components/base/text'
import { removeCapiKeyAction } from 'uiSrc/slices/oauth/cloud'
import { Pages } from 'uiSrc/constants'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiDestructiveButton, RiEmptyButton } from 'uiSrc/components/base/forms'

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
      <RiSpacer />
      <RiRow justify="end">
        <RiFlexItem>
          <RiEmptyButton
            variant="destructive"
            size="small"
            onClick={handleGoToSettings}
            className="toast-danger-btn euiBorderWidthThick"
            data-testid="go-to-settings-btn"
          >
            Go to Settings
          </RiEmptyButton>
        </RiFlexItem>
        <RiFlexItem>
          <RiDestructiveButton
            size="s"
            onClick={handleRemoveCapi}
            className="toast-danger-btn"
            data-testid="remove-api-key-btn"
          >
            Remove API key
          </RiDestructiveButton>
        </RiFlexItem>
      </RiRow>
    </>
  )
}

export default CloudCapiUnAuthorizedErrorContent
