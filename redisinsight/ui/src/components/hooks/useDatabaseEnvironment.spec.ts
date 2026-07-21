import { renderHook } from 'uiSrc/utils/test-utils'
import {
  connectedInstanceDangerousCommandsSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { Environment } from 'apiClient'

import { useDatabaseEnvironment } from './useDatabaseEnvironment'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest
    .fn()
    .mockReturnValue({ id: 'db-1', environment: 'unspecified' }),
  connectedInstanceDangerousCommandsSelector: jest.fn().mockReturnValue([]),
}))

const mockedInstance = connectedInstanceSelector as jest.Mock
const mockedDangerousCommands =
  connectedInstanceDangerousCommandsSelector as jest.Mock

const setMocks = (input: {
  environment: Environment
  dangerousCommands?: string[]
}) => {
  mockedDangerousCommands.mockReturnValue(input.dangerousCommands ?? [])
  mockedInstance.mockReturnValue({
    id: 'db-1',
    environment: input.environment,
  })
}

describe('useDatabaseEnvironment', () => {
  describe('truth table', () => {
    it('returns production when connection is marked production', () => {
      setMocks({ environment: Environment.Production })
      const { result } = renderHook(useDatabaseEnvironment)
      expect(result.current.environment).toBe(Environment.Production)
    })

    it('returns fast when connection is marked fast', () => {
      setMocks({ environment: Environment.Development })
      const { result } = renderHook(useDatabaseEnvironment)
      expect(result.current.environment).toBe(Environment.Development)
    })

    it('returns unmarked when connection is unmarked', () => {
      setMocks({ environment: Environment.Unspecified })
      const { result } = renderHook(useDatabaseEnvironment)
      expect(result.current.environment).toBe(Environment.Unspecified)
    })
  })

  describe('isDangerousCommand', () => {
    it('returns false outside production', () => {
      setMocks({
        environment: Environment.Unspecified,
        dangerousCommands: ['FLUSHDB', 'KEYS'],
      })
      const { result } = renderHook(useDatabaseEnvironment)
      expect(result.current.isDangerousCommand('FLUSHDB')).toBe(false)
    })

    it('returns false in fast mode even for known dangerous commands', () => {
      setMocks({
        environment: Environment.Development,
        dangerousCommands: ['FLUSHDB'],
      })
      const { result } = renderHook(useDatabaseEnvironment)
      expect(result.current.isDangerousCommand('FLUSHDB')).toBe(false)
    })

    it('matches case-insensitively inside production', () => {
      setMocks({
        environment: Environment.Production,
        dangerousCommands: ['FLUSHDB', 'KEYS'],
      })
      const { result } = renderHook(useDatabaseEnvironment)
      expect(result.current.isDangerousCommand('flushdb')).toBe(true)
      expect(result.current.isDangerousCommand('FlushDB')).toBe(true)
      expect(result.current.isDangerousCommand('keys')).toBe(true)
    })

    it('returns false for unknown commands inside production', () => {
      setMocks({
        environment: Environment.Production,
        dangerousCommands: ['FLUSHDB'],
      })
      const { result } = renderHook(useDatabaseEnvironment)
      expect(result.current.isDangerousCommand('GET')).toBe(false)
    })

    it('handles empty / falsy command string', () => {
      setMocks({
        environment: Environment.Production,
        dangerousCommands: ['FLUSHDB'],
      })
      const { result } = renderHook(useDatabaseEnvironment)
      expect(result.current.isDangerousCommand('')).toBe(false)
    })

    it('handles a lowercase dangerousCommands list defensively', () => {
      setMocks({
        environment: Environment.Production,
        dangerousCommands: ['flushdb'],
      })
      const { result } = renderHook(useDatabaseEnvironment)
      expect(result.current.isDangerousCommand('FLUSHDB')).toBe(true)
    })
  })
})
