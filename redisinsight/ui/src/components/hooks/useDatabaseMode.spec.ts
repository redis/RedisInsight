import { renderHook } from 'uiSrc/utils/test-utils'
import { appFeatureFlagDevProdModeSelector } from 'uiSrc/slices/app/features'
import {
  connectedInstanceDangerousCommandsSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { appSettingsSkipConfirmationsForNonProdSelector } from 'uiSrc/slices/user/user-settings'

import { useDatabaseMode } from './useDatabaseMode'

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagDevProdModeSelector: jest.fn().mockReturnValue(false),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest
    .fn()
    .mockReturnValue({ id: 'db-1', isProduction: false }),
  connectedInstanceDangerousCommandsSelector: jest.fn().mockReturnValue([]),
}))

jest.mock('uiSrc/slices/user/user-settings', () => ({
  ...jest.requireActual('uiSrc/slices/user/user-settings'),
  appSettingsSkipConfirmationsForNonProdSelector: jest
    .fn()
    .mockReturnValue(false),
}))

const mockedFlag = appFeatureFlagDevProdModeSelector as jest.Mock
const mockedInstance = connectedInstanceSelector as jest.Mock
const mockedDangerousCommands =
  connectedInstanceDangerousCommandsSelector as jest.Mock
const mockedSkipConfirmations =
  appSettingsSkipConfirmationsForNonProdSelector as jest.Mock

const setMocks = (input: {
  flag: boolean
  isProduction: boolean
  skipConfirmations: boolean
  dangerousCommands?: string[]
  connected?: boolean
}) => {
  mockedFlag.mockReturnValue(input.flag)
  mockedSkipConfirmations.mockReturnValue(input.skipConfirmations)
  mockedDangerousCommands.mockReturnValue(input.dangerousCommands ?? [])
  mockedInstance.mockReturnValue({
    id: input.connected === false ? '' : 'db-1',
    isProduction: input.isProduction,
  })
}

describe('useDatabaseMode', () => {
  describe('truth table', () => {
    it('returns disabled when flag is off', () => {
      setMocks({ flag: false, isProduction: true, skipConfirmations: true })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.mode).toBe('disabled')
    })

    it('returns production when flag on and connection is production', () => {
      setMocks({ flag: true, isProduction: true, skipConfirmations: false })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.mode).toBe('production')
    })

    it('returns production even when skip-confirmations is on', () => {
      setMocks({ flag: true, isProduction: true, skipConfirmations: true })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.mode).toBe('production')
    })

    it('returns fast when flag on, not production, skip-confirmations on', () => {
      setMocks({ flag: true, isProduction: false, skipConfirmations: true })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.mode).toBe('fast')
    })

    it('returns unmarked when flag on, not production, skip-confirmations off', () => {
      setMocks({ flag: true, isProduction: false, skipConfirmations: false })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.mode).toBe('unmarked')
    })
  })

  describe('isDangerousCommand', () => {
    it('returns false outside production', () => {
      setMocks({
        flag: true,
        isProduction: false,
        skipConfirmations: false,
        dangerousCommands: ['FLUSHDB', 'KEYS'],
      })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.isDangerousCommand('FLUSHDB')).toBe(false)
    })

    it('returns false in fast mode even for known dangerous commands', () => {
      setMocks({
        flag: true,
        isProduction: false,
        skipConfirmations: true,
        dangerousCommands: ['FLUSHDB'],
      })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.isDangerousCommand('FLUSHDB')).toBe(false)
    })

    it('matches case-insensitively inside production', () => {
      setMocks({
        flag: true,
        isProduction: true,
        skipConfirmations: false,
        dangerousCommands: ['FLUSHDB', 'KEYS'],
      })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.isDangerousCommand('flushdb')).toBe(true)
      expect(result.current.isDangerousCommand('FlushDB')).toBe(true)
      expect(result.current.isDangerousCommand('keys')).toBe(true)
    })

    it('returns false for unknown commands inside production', () => {
      setMocks({
        flag: true,
        isProduction: true,
        skipConfirmations: false,
        dangerousCommands: ['FLUSHDB'],
      })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.isDangerousCommand('GET')).toBe(false)
    })

    it('handles empty / falsy command string', () => {
      setMocks({
        flag: true,
        isProduction: true,
        skipConfirmations: false,
        dangerousCommands: ['FLUSHDB'],
      })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.isDangerousCommand('')).toBe(false)
    })

    it('handles a lowercase dangerousCommands list defensively', () => {
      setMocks({
        flag: true,
        isProduction: true,
        skipConfirmations: false,
        dangerousCommands: ['flushdb'],
      })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.isDangerousCommand('FLUSHDB')).toBe(true)
    })
  })

  describe('safe defaults', () => {
    it('returns disabled and a false isDangerousCommand when no connection is active', () => {
      setMocks({
        flag: true,
        isProduction: true,
        skipConfirmations: true,
        dangerousCommands: ['FLUSHDB'],
        connected: false,
      })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.mode).toBe('disabled')
      expect(result.current.isDangerousCommand('FLUSHDB')).toBe(false)
    })
  })
})
