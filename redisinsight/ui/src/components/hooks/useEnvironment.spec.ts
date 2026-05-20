import { renderHook } from 'uiSrc/utils/test-utils'
import { appFeatureFlagDevProdModeSelector } from 'uiSrc/slices/app/features'
import {
  connectedInstanceDangerousCommandsSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { Environment } from 'apiClient'

import { useEnvironment } from './useEnvironment'

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagDevProdModeSelector: jest.fn().mockReturnValue(false),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest
    .fn()
    .mockReturnValue({ id: 'db-1', environment: 'unspecified' }),
  connectedInstanceDangerousCommandsSelector: jest.fn().mockReturnValue([]),
}))

const mockedFlag = appFeatureFlagDevProdModeSelector as jest.Mock
const mockedInstance = connectedInstanceSelector as jest.Mock
const mockedDangerousCommands =
  connectedInstanceDangerousCommandsSelector as jest.Mock

const setMocks = (input: {
  flag: boolean
  environment: Environment
  dangerousCommands?: string[]
}) => {
  mockedFlag.mockReturnValue(input.flag)
  mockedDangerousCommands.mockReturnValue(input.dangerousCommands ?? [])
  mockedInstance.mockReturnValue({
    id: 'db-1',
    environment: input.environment,
  })
}

describe('useEnvironment', () => {
  describe('truth table', () => {
    it('falls back to unmarked when flag is off', () => {
      setMocks({ flag: false, environment: Environment.Production })
      const { result } = renderHook(useEnvironment)
      expect(result.current.environment).toBe('unspecified')
    })

    it('returns production when flag on and connection is marked production', () => {
      setMocks({ flag: true, environment: Environment.Production })
      const { result } = renderHook(useEnvironment)
      expect(result.current.environment).toBe('production')
    })

    it('returns fast when flag on and connection is marked fast', () => {
      setMocks({ flag: true, environment: Environment.Development })
      const { result } = renderHook(useEnvironment)
      expect(result.current.environment).toBe('development')
    })

    it('returns unmarked when flag on and connection is unmarked', () => {
      setMocks({ flag: true, environment: Environment.Unspecified })
      const { result } = renderHook(useEnvironment)
      expect(result.current.environment).toBe('unspecified')
    })
  })

  describe('isDangerousCommand', () => {
    it('returns false outside production', () => {
      setMocks({
        flag: true,
        environment: Environment.Unspecified,
        dangerousCommands: ['FLUSHDB', 'KEYS'],
      })
      const { result } = renderHook(useEnvironment)
      expect(result.current.isDangerousCommand('FLUSHDB')).toBe(false)
    })

    it('returns false in fast mode even for known dangerous commands', () => {
      setMocks({
        flag: true,
        environment: Environment.Development,
        dangerousCommands: ['FLUSHDB'],
      })
      const { result } = renderHook(useEnvironment)
      expect(result.current.isDangerousCommand('FLUSHDB')).toBe(false)
    })

    it('matches case-insensitively inside production', () => {
      setMocks({
        flag: true,
        environment: Environment.Production,
        dangerousCommands: ['FLUSHDB', 'KEYS'],
      })
      const { result } = renderHook(useEnvironment)
      expect(result.current.isDangerousCommand('flushdb')).toBe(true)
      expect(result.current.isDangerousCommand('FlushDB')).toBe(true)
      expect(result.current.isDangerousCommand('keys')).toBe(true)
    })

    it('returns false for unknown commands inside production', () => {
      setMocks({
        flag: true,
        environment: Environment.Production,
        dangerousCommands: ['FLUSHDB'],
      })
      const { result } = renderHook(useEnvironment)
      expect(result.current.isDangerousCommand('GET')).toBe(false)
    })

    it('handles empty / falsy command string', () => {
      setMocks({
        flag: true,
        environment: Environment.Production,
        dangerousCommands: ['FLUSHDB'],
      })
      const { result } = renderHook(useEnvironment)
      expect(result.current.isDangerousCommand('')).toBe(false)
    })

    it('handles a lowercase dangerousCommands list defensively', () => {
      setMocks({
        flag: true,
        environment: Environment.Production,
        dangerousCommands: ['flushdb'],
      })
      const { result } = renderHook(useEnvironment)
      expect(result.current.isDangerousCommand('FLUSHDB')).toBe(true)
    })
  })
})
