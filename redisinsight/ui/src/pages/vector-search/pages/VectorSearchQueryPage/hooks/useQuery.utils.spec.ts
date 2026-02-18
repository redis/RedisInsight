import { faker } from '@faker-js/faker'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { WORKBENCH_HISTORY_MAX_LENGTH } from 'uiSrc/pages/workbench/constants'
import {
  sortCommandsByDate,
  prepareNewItems,
  createGroupItem,
  createErrorResult,
  limitHistoryLength,
  generateCommandId,
} from './useQuery.utils'

describe('useQuery.utils', () => {
  describe('sortCommandsByDate', () => {
    it('should sort commands by date in descending order (newest first)', () => {
      const older = new Date('2025-01-01')
      const newer = new Date('2025-06-01')

      const items: CommandExecutionUI[] = [
        { id: '1', command: 'SET a b', createdAt: older },
        { id: '2', command: 'GET a', createdAt: newer },
      ]

      const result = sortCommandsByDate(items)
      expect(result[0].id).toBe('2')
      expect(result[1].id).toBe('1')
    })

    it('should handle items without createdAt', () => {
      const items: CommandExecutionUI[] = [
        { id: '1', command: 'SET a b' },
        { id: '2', command: 'GET a', createdAt: new Date('2025-01-01') },
      ]

      const result = sortCommandsByDate(items)
      expect(result[0].id).toBe('2')
      expect(result[1].id).toBe('1')
    })

    it('should return empty array for empty input', () => {
      expect(sortCommandsByDate([])).toEqual([])
    })

    it('should handle single item', () => {
      const items: CommandExecutionUI[] = [
        { id: '1', command: 'SET a b', createdAt: new Date() },
      ]
      expect(sortCommandsByDate(items)).toHaveLength(1)
    })
  })

  describe('prepareNewItems', () => {
    it('should create loading items for each command', () => {
      const commands = ['SET key value', 'GET key']
      const commandId = faker.string.numeric(10)

      const result = prepareNewItems(commands, commandId)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        command: 'SET key value',
        id: `${commandId}0`,
        loading: true,
        isOpen: true,
        error: '',
      })
      expect(result[1]).toEqual({
        command: 'GET key',
        id: `${commandId}1`,
        loading: true,
        isOpen: true,
        error: '',
      })
    })

    it('should return empty array for empty commands', () => {
      expect(prepareNewItems([], 'id')).toEqual([])
    })
  })

  describe('createGroupItem', () => {
    it('should create a group item with correct command text', () => {
      const commandId = faker.string.numeric(10)

      const result = createGroupItem(5, commandId)

      expect(result).toEqual({
        command: '5 - Command(s)',
        id: commandId,
        loading: true,
        isOpen: true,
        error: '',
      })
    })
  })

  describe('createErrorResult', () => {
    it('should create an error result array', () => {
      const message = faker.lorem.sentence()

      const result = createErrorResult(message)

      expect(result).toEqual([
        {
          response: message,
          status: CommandExecutionStatus.Fail,
        },
      ])
    })
  })

  describe('limitHistoryLength', () => {
    it('should return items unchanged when under max length', () => {
      const items: CommandExecutionUI[] = Array.from({ length: 5 }, (_, i) => ({
        id: `${i}`,
        command: faker.lorem.word(),
      }))

      expect(limitHistoryLength(items)).toHaveLength(5)
    })

    it('should trim items to max length when over limit', () => {
      const items: CommandExecutionUI[] = Array.from(
        { length: WORKBENCH_HISTORY_MAX_LENGTH + 10 },
        (_, i) => ({
          id: `${i}`,
          command: faker.lorem.word(),
        }),
      )

      const result = limitHistoryLength(items)
      expect(result).toHaveLength(WORKBENCH_HISTORY_MAX_LENGTH)
    })

    it('should return items unchanged when at exact max length', () => {
      const items: CommandExecutionUI[] = Array.from(
        { length: WORKBENCH_HISTORY_MAX_LENGTH },
        (_, i) => ({
          id: `${i}`,
          command: faker.lorem.word(),
        }),
      )

      expect(limitHistoryLength(items)).toHaveLength(
        WORKBENCH_HISTORY_MAX_LENGTH,
      )
    })

    it('should handle empty array', () => {
      expect(limitHistoryLength([])).toEqual([])
    })
  })

  describe('generateCommandId', () => {
    it('should return a string', () => {
      expect(typeof generateCommandId()).toBe('string')
    })

    it('should return a timestamp-based id', () => {
      const before = Date.now()
      const id = generateCommandId()
      const after = Date.now()

      const idNum = Number(id)
      expect(idNum).toBeGreaterThanOrEqual(before)
      expect(idNum).toBeLessThanOrEqual(after)
    })
  })
})
