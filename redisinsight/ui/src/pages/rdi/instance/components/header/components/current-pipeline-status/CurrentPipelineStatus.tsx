import React from 'react'
import { PipelineState } from 'uiSrc/slices/interfaces'
import { formatLongName, Maybe } from 'uiSrc/utils'
import { Icon, IconProps } from 'uiSrc/components/base/icons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Loader } from 'uiSrc/components/base/display'
import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import {
  IndicatorSyncingIcon,
  IndicatorSyncedIcon,
  IndicatorSyncstoppedIcon,
  IndicatorSyncerrorIcon,
} from '@redis-ui/icons'
import { IconType } from 'uiSrc/components/base/forms/buttons'

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
    icon: IconType
    iconColor: IconProps['color']
  } => {
    switch (pipelineState) {
      case PipelineState.InitialSync:
        return {
          icon: IndicatorSyncingIcon,
          iconColor: 'success300',
          label: 'Initial sync',
        }
      case PipelineState.CDC:
        return {
          icon: IndicatorSyncedIcon,
          iconColor: 'success500',
          label: 'Streaming',
        }
      case PipelineState.NotRunning:
        return {
          icon: IndicatorSyncstoppedIcon,
          iconColor: 'attention500',
          label: 'Not running',
        }
      default:
        return {
          icon: IndicatorSyncerrorIcon,
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
        <Title size="XS" color="primary">
          Pipeline state
        </Title>
      </FlexItem>
      <FlexItem>
        {headerLoading ? (
          <Loader size="m" style={{ marginLeft: '8px' }} />
        ) : (
          <RiTooltip
            content={errorTooltipContent}
            anchorClassName={statusError}
          >
            <Row data-testid="pipeline-state-badge" gap="s" align="center">
              <Icon icon={stateInfo.icon} color={stateInfo.iconColor} />
              <Text>{stateInfo.label}</Text>
            </Row>
          </RiTooltip>
        )}
      </FlexItem>
    </Row>
  )
}

export default CurrentPipelineStatus
