import {
  IndicatorSyncingIcon,
  IndicatorSyncedIcon,
  IndicatorSyncstoppedIcon,
  IndicatorSyncerrorIcon,
} from '@redis-ui/icons'
import { PipelineState, PipelineStatus } from 'uiSrc/slices/interfaces'
import {
  getStatusToShowFromState,
  getStatusToShowFromStatus,
  StatusInfo,
} from './utils'

describe('getStatusToShowFromState', () => {
  it('should return Initial sync info for InitialSync state', () => {
    const result = getStatusToShowFromState(PipelineState.InitialSync)

    expect(result).toEqual<StatusInfo>({
      icon: IndicatorSyncingIcon,
      iconColor: 'success300',
      label: 'Initial sync',
    })
  })

  it('should return Streaming info for CDC state', () => {
    const result = getStatusToShowFromState(PipelineState.CDC)

    expect(result).toEqual<StatusInfo>({
      icon: IndicatorSyncedIcon,
      iconColor: 'success500',
      label: 'Streaming',
    })
  })

  it('should return Not running info for NotRunning state', () => {
    const result = getStatusToShowFromState(PipelineState.NotRunning)

    expect(result).toEqual<StatusInfo>({
      icon: IndicatorSyncstoppedIcon,
      iconColor: 'attention500',
      label: 'Not running',
    })
  })

  it('should return Error info for undefined state', () => {
    const result = getStatusToShowFromState(undefined)

    expect(result).toEqual<StatusInfo>({
      icon: IndicatorSyncerrorIcon,
      iconColor: 'danger500',
      label: 'Error',
    })
  })

  it('should return Error info for unknown state', () => {
    const result = getStatusToShowFromState('unknown' as PipelineState)

    expect(result).toEqual<StatusInfo>({
      icon: IndicatorSyncerrorIcon,
      iconColor: 'danger500',
      label: 'Error',
    })
  })
})

describe('getStatusToShowFromStatus', () => {
  describe('transitioning statuses - syncing icon with attention color', () => {
    it.each([
      PipelineStatus.Creating,
      PipelineStatus.Deleting,
      PipelineStatus.Pending,
      PipelineStatus.Resetting,
      PipelineStatus.Starting,
      PipelineStatus.Stopping,
      PipelineStatus.Updating,
      PipelineStatus.NotReady,
    ])('should return syncing icon for %s status', (status) => {
      const result = getStatusToShowFromStatus(status)

      expect(result).toEqual<StatusInfo>({
        label: expect.any(String),
        icon: IndicatorSyncingIcon,
        iconColor: 'attention500',
      })
      expect(result.label).toBe(
        status.charAt(0).toUpperCase() + status.slice(1),
      )
    })
  })

  describe('stopped status - stopped icon with attention color', () => {
    it('should return stopped icon for Stopped status', () => {
      const result = getStatusToShowFromStatus(PipelineStatus.Stopped)

      expect(result).toEqual<StatusInfo>({
        label: 'Stopped',
        icon: IndicatorSyncstoppedIcon,
        iconColor: 'attention500',
      })
    })
  })

  describe('running statuses - synced icon with success color', () => {
    it.each([PipelineStatus.Started, PipelineStatus.Ready])(
      'should return synced icon for %s status',
      (status) => {
        const result = getStatusToShowFromStatus(status)

        expect(result).toEqual<StatusInfo>({
          label: expect.any(String),
          icon: IndicatorSyncedIcon,
          iconColor: 'success500',
        })
      },
    )
  })

  describe('error/unknown statuses - error icon with danger color', () => {
    it('should return error icon for Error status', () => {
      const result = getStatusToShowFromStatus(PipelineStatus.Error)

      expect(result).toEqual<StatusInfo>({
        label: 'Error',
        icon: IndicatorSyncerrorIcon,
        iconColor: 'danger500',
      })
    })

    it('should return error icon for Unknown status', () => {
      const result = getStatusToShowFromStatus(PipelineStatus.Unknown)

      expect(result).toEqual<StatusInfo>({
        label: 'Unknown',
        icon: IndicatorSyncerrorIcon,
        iconColor: 'danger500',
      })
    })

    it('should return error icon for undefined status', () => {
      const result = getStatusToShowFromStatus(undefined)

      expect(result).toEqual<StatusInfo>({
        label: 'Error',
        icon: IndicatorSyncerrorIcon,
        iconColor: 'danger500',
      })
    })

    it('should return error icon for unknown status value', () => {
      const result = getStatusToShowFromStatus(
        'some-unknown-status' as PipelineStatus,
      )

      expect(result).toEqual<StatusInfo>({
        label: 'Some-unknown-status',
        icon: IndicatorSyncerrorIcon,
        iconColor: 'danger500',
      })
    })
  })
})
