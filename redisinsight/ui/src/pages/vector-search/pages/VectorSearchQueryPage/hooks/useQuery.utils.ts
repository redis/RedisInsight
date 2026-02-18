import { scrollIntoView } from 'uiSrc/utils'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { WORKBENCH_HISTORY_MAX_LENGTH } from 'uiSrc/pages/workbench/constants'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'

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

export const generateCommandId = (): string => `${Date.now()}`
