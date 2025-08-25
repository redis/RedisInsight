import React from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { bufferToString } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { Text } from 'uiSrc/components/base/text'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'

const StyledWrapper = styled.div`
  margin-top: 15px;
`

const StyledKeyNameWrapper = styled(FlexGroup)<{ $isDbAnalysis: boolean }>`
  margin-top: 5px;
  border: 1px dashed ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: 4px;
  background-color: ${(props) =>
    props.$isDbAnalysis
      ? props.theme.semantic.color.background.neutral100
      : props.theme.semantic.color.background.neutral400};
`

const StyledKeyName = styled(Text)`
  padding: 4px;
  font:
    normal normal normal 13px/16px Graphik,
    sans-serif !important;
  height: 26px;
`

const StyledText = styled(Text)`
  font:
    normal normal normal 13px/16px Graphik,
    sans-serif !important;
`

const StyledIconButton = styled(IconButton)`
  margin-right: 5px;
`

export interface IProps {
  keyName: string
  provider?: string
  telemetryEvent: string
  live?: boolean
}

const RecommendationCopyComponent = ({
  live = false,
  keyName,
  telemetryEvent,
  provider,
}: IProps) => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const formattedName = bufferToString(keyName)

  const handleCopy = () => {
    sendEventTelemetry({
      event: live
        ? TelemetryEvent.INSIGHTS_TIPS_KEY_COPIED
        : TelemetryEvent.DATABASE_TIPS_KEY_COPIED,
      eventData: {
        databaseId: instanceId,
        name: telemetryEvent,
        provider,
      },
    })
    navigator?.clipboard?.writeText(formattedName)
  }

  return (
    <StyledWrapper>
      <StyledText>Example of a key that may be relevant:</StyledText>
      <StyledKeyNameWrapper align="center" $isDbAnalysis={!live}>
        <StyledKeyName
          className="truncateText"
          data-testid="recommendation-key-name"
          component="div"
        >
          {formattedName}
        </StyledKeyName>
        <StyledIconButton
          onClick={handleCopy}
          icon={CopyIcon}
          data-testid="copy-key-name-btn"
          aria-label="copy key name"
        />
      </StyledKeyNameWrapper>
    </StyledWrapper>
  )
}

export default RecommendationCopyComponent
