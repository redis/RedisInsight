import React from 'react'
import { capitalize } from 'lodash'
import { PipelineState, PipelineStatus } from 'uiSrc/slices/interfaces'
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

interface StatusInfo {
  label: string
  icon: IconType
  iconColor: IconProps['color']
}

export interface Props {
  pipelineState?: PipelineState
  pipelineStatus?: PipelineStatus
  statusError?: string
  headerLoading: boolean
}

const CurrentPipelineStatus = ({
  pipelineState,
  pipelineStatus,
  statusError,
  headerLoading,
}: Props) => {
  const getStatusToShowFromState = (
    pipelineState: Maybe<PipelineState>,
  ): StatusInfo => {
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

  const getStatusToShowFromStatus = (
    status: Maybe<PipelineStatus>,
  ): StatusInfo => {
    const label = capitalize(status || 'Error')

    switch (status) {
      case PipelineStatus.Creating:
      case PipelineStatus.Deleting:
      case PipelineStatus.Pending:
      case PipelineStatus.Resetting:
      case PipelineStatus.Starting:
      case PipelineStatus.Stopping:
      case PipelineStatus.Updating:
      case PipelineStatus.NotReady:
        return {
          label,
          icon: IndicatorSyncingIcon,
          iconColor: 'attention500',
        }
      case PipelineStatus.Stopped:
        return {
          label,
          icon: IndicatorSyncstoppedIcon,
          iconColor: 'attention500',
        }
      case PipelineStatus.Started:
      case PipelineStatus.Ready:
        return {
          label,
          icon: IndicatorSyncedIcon,
          iconColor: 'success500',
        }
      default:
        return {
          label,
          icon: IndicatorSyncerrorIcon,
          iconColor: 'danger500',
        }
    }
  }

  const stateInfo = pipelineState
    ? getStatusToShowFromState(pipelineState)
    : getStatusToShowFromStatus(pipelineStatus)
  const errorTooltipContent = statusError && formatLongName(statusError)

  return (
    <Row align="center" gap="m">
      <FlexItem>
        <Title size="XS" color="primary">
          Pipeline status
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
            <Row data-testid="pipeline-status-badge" gap="s" align="center">
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
