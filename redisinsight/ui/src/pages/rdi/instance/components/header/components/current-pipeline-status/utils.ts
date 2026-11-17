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
import i18n from 'uiSrc/i18n'

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
        label: i18n.t('rdi.instance.status.initialSync'),
      }
    case PipelineState.CDC:
      return {
        icon: IndicatorSyncedIcon,
        iconColor: 'success500',
        label: i18n.t('rdi.instance.status.streaming'),
      }
    case PipelineState.NotRunning:
      return {
        icon: IndicatorSyncstoppedIcon,
        iconColor: 'attention500',
        label: i18n.t('rdi.instance.status.notRunning'),
      }
    default:
      return {
        icon: IndicatorSyncerrorIcon,
        iconColor: 'danger500',
        label: i18n.t('rdi.instance.status.error'),
      }
  }
}

const STATUS_LABEL_KEYS: Record<PipelineStatus, string> = {
  [PipelineStatus.Ready]: 'rdi.instance.status.ready',
  [PipelineStatus.NotReady]: 'rdi.instance.status.notReady',
  [PipelineStatus.Stopping]: 'rdi.instance.status.stopping',
  [PipelineStatus.Started]: 'rdi.instance.status.started',
  [PipelineStatus.Stopped]: 'rdi.instance.status.stopped',
  [PipelineStatus.Error]: 'rdi.instance.status.error',
  [PipelineStatus.Creating]: 'rdi.instance.status.creating',
  [PipelineStatus.Updating]: 'rdi.instance.status.updating',
  [PipelineStatus.Deleting]: 'rdi.instance.status.deleting',
  [PipelineStatus.Starting]: 'rdi.instance.status.starting',
  [PipelineStatus.Resetting]: 'rdi.instance.status.resetting',
  [PipelineStatus.Pending]: 'rdi.instance.status.pending',
  [PipelineStatus.Unknown]: 'rdi.instance.status.unknown',
}

export const getStatusToShowFromStatus = (
  status: Maybe<PipelineStatus>,
): StatusInfo => {
  const label = !status
    ? i18n.t('rdi.instance.status.error')
    : STATUS_LABEL_KEYS[status]
      ? i18n.t(STATUS_LABEL_KEYS[status] as never)
      : capitalize(status)

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
