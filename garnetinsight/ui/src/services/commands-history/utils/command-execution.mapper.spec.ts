import { CommandExecution } from 'uiSrc/slices/interfaces'
import { mapCommandExecutionToUI } from './command-execution.mapper'
import { EMPTY_COMMAND } from 'uiSrc/constants'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { commandExecutionFactory } from 'uiSrc/mocks/factories/workbench/commandExectution.factory'

describe('mapCommandExecutionToUI', () => {
  it('should map command execution with valid command', () => {
    const mockCommandExecution: CommandExecution =
      commandExecutionFactory.build()

    const result = mapCommandExecutionToUI(mockCommandExecution)

    expect(result).toEqual({
      ...mockCommandExecution,
      command: mockCommandExecution.command,
      emptyCommand: false,
    })
  })

  it.each([
    ['empty string', ''],
    ['null', null],
    ['undefined', undefined],
  ])('should map command execution with %s command', (_, commandValue) => {
    const mockCommandExecution = commandExecutionFactory.build({
      command: commandValue as any,
    })

    const result = mapCommandExecutionToUI(mockCommandExecution)

    expect(result).toEqual({
      ...mockCommandExecution,
      command: EMPTY_COMMAND,
      emptyCommand: true,
    })
  })

  it('should preserve all original properties', () => {
    const mockCommandExecution = commandExecutionFactory.build({
      id: '5',
      databaseId: 'db5',
      command: 'PING',
      result: [{ response: 'OK', status: CommandExecutionStatus.Success }],
      createdAt: new Date('2023-01-01'),
    })

    const result = mapCommandExecutionToUI(mockCommandExecution)

    expect(result).toMatchObject({
      id: mockCommandExecution.id,
      databaseId: mockCommandExecution.databaseId,
      command: mockCommandExecution.command,
      result: mockCommandExecution.result,
      createdAt: mockCommandExecution.createdAt,
    })
  })
})
