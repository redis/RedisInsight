import { scrollIntoView, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { EMPTY_COMMAND, ApiEndpoints } from 'uiSrc/constants'
import {
  RunQueryMode,
  ResultsMode,
  CommandExecutionUI,
  CommandExecution,
  CommandExecutionType,
} from 'uiSrc/slices/interfaces'
import { apiService } from 'uiSrc/services'
import { WORKBENCH_HISTORY_MAX_LENGTH } from 'uiSrc/pages/workbench/constants'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { getLocalWbHistory } from 'uiSrc/services/workbenchStorage'

export const sortCommandsByDate = (
  commands: CommandExecutionUI[],
): CommandExecutionUI[] =>
  commands.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime()
    const dateB = new Date(b.createdAt || 0).getTime()
    return dateB - dateA
  })

export const prepareNewItems = (
  commands: string[],
  commandId: string,
): CommandExecutionUI[] =>
  commands.map((command, i) => ({
    command,
    id: commandId + i,
    loading: true,
    isOpen: true,
    error: '',
  }))

export const createGroupItem = (
  itemCount: number,
  commandId: string,
): CommandExecutionUI => ({
  command: `${itemCount} - Command(s)`,
  id: commandId,
  loading: true,
  isOpen: true,
  error: '',
})

export const createErrorResult = (message: string) => [
  {
    response: message,
    status: CommandExecutionStatus.Fail,
  },
]

export const scrollToElement = (
  element: HTMLDivElement | null,
  inline: ScrollLogicalPosition = 'start',
) => {
  if (!element) return

  requestAnimationFrame(() => {
    scrollIntoView(element, {
      behavior: 'smooth',
      block: 'nearest',
      inline,
    })
  })
}

export const limitHistoryLength = (
  items: CommandExecutionUI[],
): CommandExecutionUI[] =>
  items.length > WORKBENCH_HISTORY_MAX_LENGTH
    ? items.slice(0, WORKBENCH_HISTORY_MAX_LENGTH)
    : items

export const loadHistoryData = async (
  instanceId: string,
): Promise<CommandExecutionUI[]> => {
  const commandsHistory = await getLocalWbHistory(instanceId)
  if (!Array.isArray(commandsHistory)) {
    return []
  }

  const processedHistory = commandsHistory.map((item) => ({
    ...item,
    command: item.command || EMPTY_COMMAND,
    emptyCommand: !item.command,
  }))

  return sortCommandsByDate(processedHistory)
}

export const executeApiCall = async (
  instanceId: string,
  commands: string[],
  activeRunQueryMode: RunQueryMode,
  resultsMode: ResultsMode,
): Promise<CommandExecution[]> => {
  const { data, status } = await apiService.post<CommandExecution[]>(
    getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
    {
      commands,
      mode: activeRunQueryMode,
      resultsMode,
      type: CommandExecutionType.Search,
    },
  )

  if (!isStatusSuccessful(status)) {
    throw new Error(`API call failed with status: ${status}`)
  }

  return data
}

export const generateCommandId = (): string => `${Date.now()}`
