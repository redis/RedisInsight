import { renderHook } from 'uiSrc/utils/test-utils'
import { appFeatureFlagDevProdModeSelector } from 'uiSrc/slices/app/features'
import {
  connectedInstanceDangerousCommandsSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { DatabaseModeValue } from 'uiSrc/slices/interfaces'

import { useDatabaseMode } from './useDatabaseMode'

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagDevProdModeSelector: jest.fn().mockReturnValue(false),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest
    .fn()
    .mockReturnValue({ id: 'db-1', databaseMode: 'unmarked' }),
  connectedInstanceDangerousCommandsSelector: jest.fn().mockReturnValue([]),
}))

const mockedFlag = appFeatureFlagDevProdModeSelector as jest.Mock
const mockedInstance = connectedInstanceSelector as jest.Mock
const mockedDangerousCommands =
  connectedInstanceDangerousCommandsSelector as jest.Mock

const setMocks = (input: {
  flag: boolean
  databaseMode: DatabaseModeValue
  dangerousCommands?: string[]
  connected?: boolean
}) => {
  mockedFlag.mockReturnValue(input.flag)
  mockedDangerousCommands.mockReturnValue(input.dangerousCommands ?? [])
  mockedInstance.mockReturnValue({
    id: input.connected === false ? '' : 'db-1',
    databaseMode: input.databaseMode,
  })
}

describe('useDatabaseMode', () => {
  describe('truth table', () => {
    it('returns disabled when flag is off', () => {
      setMocks({ flag: false, databaseMode: 'production' })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.mode).toBe('disabled')
    })

    it('returns production when flag on and connection is marked production', () => {
      setMocks({ flag: true, databaseMode: 'production' })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.mode).toBe('production')
    })

    it('returns fast when flag on and connection is marked fast', () => {
      setMocks({ flag: true, databaseMode: 'fast' })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.mode).toBe('fast')
    })

    it('returns unmarked when flag on and connection is unmarked', () => {
      setMocks({ flag: true, databaseMode: 'unmarked' })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.mode).toBe('unmarked')
    })
  })

  describe('isDangerousCommand', () => {
    it('returns false outside production', () => {
      setMocks({
        flag: true,
        databaseMode: 'unmarked',
        dangerousCommands: ['FLUSHDB', 'KEYS'],
      })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.isDangerousCommand('FLUSHDB')).toBe(false)
    })

    it('returns false in fast mode even for known dangerous commands', () => {
      setMocks({
        flag: true,
        databaseMode: 'fast',
        dangerousCommands: ['FLUSHDB'],
      })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.isDangerousCommand('FLUSHDB')).toBe(false)
    })

    it('matches case-insensitively inside production', () => {
      setMocks({
        flag: true,
        databaseMode: 'production',
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
        databaseMode: 'production',
        dangerousCommands: ['FLUSHDB'],
      })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.isDangerousCommand('GET')).toBe(false)
    })

    it('handles empty / falsy command string', () => {
      setMocks({
        flag: true,
        databaseMode: 'production',
        dangerousCommands: ['FLUSHDB'],
      })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.isDangerousCommand('')).toBe(false)
    })

    it('handles a lowercase dangerousCommands list defensively', () => {
      setMocks({
        flag: true,
        databaseMode: 'production',
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
        databaseMode: 'production',
        dangerousCommands: ['FLUSHDB'],
        connected: false,
      })
      const { result } = renderHook(useDatabaseMode)
      expect(result.current.mode).toBe('disabled')
      expect(result.current.isDangerousCommand('FLUSHDB')).toBe(false)
    })
  })
})
