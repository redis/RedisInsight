import { capitalize } from 'lodash'
import {
  IndicatorSyncingIcon,
  IndicatorSyncedIcon,
  IndicatorSyncstoppedIcon,
  IndicatorSyncerrorIcon,
} from '@redis-ui/icons'
import { PipelineState, PipelineStatus } from 'uiSrc/slices/interfaces'
import { IconProps } from 'uiSrc/components/base/icons'
import { IconType } from 'uiSrc/components/base/forms/buttons'
import { Maybe } from 'uiSrc/utils'

export interface StatusInfo {
  label: string
  icon: IconType
  iconColor: IconProps['color']
}

export const getStatusToShowFromState = (
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

export const getStatusToShowFromStatus = (
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
