import React from 'react'
import { PipelineState } from 'uiSrc/slices/interfaces'
import { formatLongName, Maybe } from 'uiSrc/utils'
import { AllIconsType, RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { IconProps } from 'uiSrc/components/base/icons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Loader } from 'uiSrc/components/base/display'
import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export interface Props {
  pipelineState?: PipelineState
  statusError?: string
  headerLoading: boolean
}

const CurrentPipelineStatus = ({
  pipelineState,
  statusError,
  headerLoading,
}: Props) => {
  const getPipelineStateIconAndLabel = (
    pipelineState: Maybe<PipelineState>,
  ): {
    label: string
    icon: AllIconsType
    iconColor: IconProps['color']
  } => {
    switch (pipelineState) {
      case PipelineState.InitialSync:
        return {
          icon: 'IndicatorSyncingIcon',
          iconColor: 'success300',
          label: 'Initial sync',
        }
      case PipelineState.CDC:
        return {
          icon: 'IndicatorSyncedIcon',
          iconColor: 'success300',
          label: 'Streaming',
        }
      case PipelineState.NotRunning:
        return {
          icon: 'IndicatorXIcon',
          iconColor: 'attention500',
          label: 'Not running',
        }
      default:
        return {
          icon: 'IndicatorErrorIcon',
          iconColor: 'danger500',
          label: 'Error',
        }
    }
  }
  const stateInfo = getPipelineStateIconAndLabel(pipelineState)
  const errorTooltipContent = statusError && formatLongName(statusError)

  return (
    <Row align="center" gap="m">
      <FlexItem>
        <Title size="XS">Pipeline state:</Title>
      </FlexItem>
      <FlexItem>
        {headerLoading ? (
          <Loader size="m" style={{ marginLeft: '8px' }} />
        ) : (
          <RiTooltip
            content={errorTooltipContent}
            anchorClassName={statusError}
          >
            <Row data-testid="pipeline-state-badge" gap="s">
              <RiIcon
                type={stateInfo.icon}
                color={stateInfo.iconColor}
                size="m"
              />
              <Text size="s">{stateInfo.label}</Text>
            </Row>
          </RiTooltip>
        )}
      </FlexItem>
    </Row>
  )
}

export default CurrentPipelineStatus
