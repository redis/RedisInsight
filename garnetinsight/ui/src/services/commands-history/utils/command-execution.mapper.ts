import { EMPTY_COMMAND } from 'uiSrc/constants'
import { CommandExecution, CommandExecutionUI } from 'uiSrc/slices/interfaces'

export const mapCommandExecutionToUI = (
  item: CommandExecution,
): CommandExecutionUI => {
  return {
    ...item,
    command: item.command || EMPTY_COMMAND,
    emptyCommand: !item.command,
  }
}
