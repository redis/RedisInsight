import { CreateCommandExecutionDto as CreateCommandExecutionDtoAPI } from 'apiSrc/modules/workbench/dto/create-command-execution.dto'
import { CommandExecution as CommandExecutionAPI } from 'apiSrc/modules/workbench/models/command-execution'
import { CommandExecutionResult as CommandExecutionResultAPI } from 'apiSrc/modules/workbench/models/command-execution-result'

interface CreateCommandExecutionDto extends CreateCommandExecutionDtoAPI {}
interface CommandExecution extends CommandExecutionAPI {}
interface CommandExecutionResult extends CommandExecutionResultAPI {}

export { CommandExecution, CommandExecutionResult, CreateCommandExecutionDto }
