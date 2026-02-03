import { PipelineAction, PipelineStatus } from 'uiSrc/slices/interfaces'

export interface ActionButtonState {
  button: 'start' | 'stop' | null
  disabled: boolean
}

export const getActionButtonState = (
  action: PipelineAction | null,
  pipelineStatus: PipelineStatus | undefined,
  disabled: boolean,
): ActionButtonState => {
  if (action === PipelineAction.Stop) {
    return {
      disabled: true,
      button: 'stop',
    }
  }

  if (action === PipelineAction.Start) {
    return {
      disabled: true,
      button: 'start',
    }
  }

  switch (pipelineStatus) {
    case PipelineStatus.NotReady: // v1 status
    case PipelineStatus.Stopped:
      return {
        disabled,
        button: 'start',
      }
    case PipelineStatus.Ready: // v1 status
    case PipelineStatus.Unknown:
    case PipelineStatus.Error:
    case PipelineStatus.Started:
      return {
        disabled,
        button: 'stop',
      }
    case PipelineStatus.Stopping:
    case PipelineStatus.Starting:
    case PipelineStatus.Creating:
    case PipelineStatus.Updating:
    case PipelineStatus.Deleting:
    case PipelineStatus.Resetting:
    case PipelineStatus.Pending:
      return {
        disabled: true,
        button: 'stop',
      }
    default:
      return {
        disabled: true,
        button: null,
      }
  }
}
