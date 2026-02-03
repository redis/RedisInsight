import { PipelineAction, PipelineStatus } from 'uiSrc/slices/interfaces'
import { getActionButtonState, ActionButtonState } from './utils'

describe('getActionButtonState', () => {
  describe('when action is in progress', () => {
    it('should return disabled stop button when Stop action is in progress', () => {
      const result = getActionButtonState(PipelineAction.Stop, undefined, false)

      expect(result).toEqual<ActionButtonState>({
        disabled: true,
        button: 'stop',
      })
    })

    it('should return disabled start button when Start action is in progress', () => {
      const result = getActionButtonState(
        PipelineAction.Start,
        undefined,
        false,
      )

      expect(result).toEqual<ActionButtonState>({
        disabled: true,
        button: 'start',
      })
    })

    it('should ignore pipeline status when action is Stop', () => {
      const result = getActionButtonState(
        PipelineAction.Stop,
        PipelineStatus.Stopped,
        false,
      )

      expect(result).toEqual<ActionButtonState>({
        disabled: true,
        button: 'stop',
      })
    })

    it('should ignore pipeline status when action is Start', () => {
      const result = getActionButtonState(
        PipelineAction.Start,
        PipelineStatus.Started,
        false,
      )

      expect(result).toEqual<ActionButtonState>({
        disabled: true,
        button: 'start',
      })
    })

    it('should ignore disabled param when action is in progress', () => {
      const result = getActionButtonState(
        PipelineAction.Stop,
        PipelineStatus.Started,
        true,
      )

      expect(result).toEqual<ActionButtonState>({
        disabled: true,
        button: 'stop',
      })
    })
  })

  describe('when no action is in progress - show start button', () => {
    it.each([PipelineStatus.NotReady, PipelineStatus.Stopped])(
      'should return start button with disabled=false for %s status',
      (status) => {
        const result = getActionButtonState(null, status, false)

        expect(result).toEqual<ActionButtonState>({
          disabled: false,
          button: 'start',
        })
      },
    )

    it.each([PipelineStatus.NotReady, PipelineStatus.Stopped])(
      'should return start button with disabled=true for %s status when disabled param is true',
      (status) => {
        const result = getActionButtonState(null, status, true)

        expect(result).toEqual<ActionButtonState>({
          disabled: true,
          button: 'start',
        })
      },
    )
  })

  describe('when no action is in progress - show stop button', () => {
    it.each([
      PipelineStatus.Ready,
      PipelineStatus.Unknown,
      PipelineStatus.Error,
      PipelineStatus.Started,
    ])(
      'should return stop button with disabled=false for %s status',
      (status) => {
        const result = getActionButtonState(null, status, false)

        expect(result).toEqual<ActionButtonState>({
          disabled: false,
          button: 'stop',
        })
      },
    )

    it.each([
      PipelineStatus.Ready,
      PipelineStatus.Unknown,
      PipelineStatus.Error,
      PipelineStatus.Started,
    ])(
      'should return stop button with disabled=true for %s status when disabled param is true',
      (status) => {
        const result = getActionButtonState(null, status, true)

        expect(result).toEqual<ActionButtonState>({
          disabled: true,
          button: 'stop',
        })
      },
    )
  })

  describe('when no action is in progress - transitioning statuses (always disabled)', () => {
    it.each([
      PipelineStatus.Stopping,
      PipelineStatus.Starting,
      PipelineStatus.Creating,
      PipelineStatus.Updating,
      PipelineStatus.Deleting,
      PipelineStatus.Resetting,
      PipelineStatus.Pending,
    ])(
      'should return disabled stop button for %s status regardless of disabled param',
      (status) => {
        const resultWithDisabledFalse = getActionButtonState(
          null,
          status,
          false,
        )
        const resultWithDisabledTrue = getActionButtonState(null, status, true)

        expect(resultWithDisabledFalse).toEqual<ActionButtonState>({
          disabled: true,
          button: 'stop',
        })
        expect(resultWithDisabledTrue).toEqual<ActionButtonState>({
          disabled: true,
          button: 'stop',
        })
      },
    )
  })

  describe('when no action and undefined/unknown status', () => {
    it('should return disabled null button when status is undefined', () => {
      const result = getActionButtonState(null, undefined, false)

      expect(result).toEqual<ActionButtonState>({
        disabled: true,
        button: null,
      })
    })

    it('should return disabled null button for unknown status value', () => {
      const result = getActionButtonState(
        null,
        'some-unknown-status' as PipelineStatus,
        false,
      )

      expect(result).toEqual<ActionButtonState>({
        disabled: true,
        button: null,
      })
    })
  })

  describe('Reset action does not affect button state', () => {
    it('should use pipeline status when action is Reset', () => {
      const result = getActionButtonState(
        PipelineAction.Reset,
        PipelineStatus.Started,
        false,
      )

      expect(result).toEqual<ActionButtonState>({
        disabled: false,
        button: 'stop',
      })
    })
  })
})
