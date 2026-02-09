import { useEffect, useRef } from 'react'

import { CommandExecutionUI } from 'uiSrc/slices/interfaces'

import { UseCommandHistoryProps } from './useCommandHistory.types'

/**
 * Provides command history navigation via Up arrow key
 * when cursor is at position (1,1) and suggestions are not open.
 */
export const useCommandHistory = ({
  monacoObjects,
  historyItems,
}: UseCommandHistoryProps) => {
  const execHistoryRef = useRef<CommandExecutionUI[]>([])
  const execHistoryPosRef = useRef<number>(0)

  // Sync history items from external state
  useEffect(() => {
    execHistoryRef.current = historyItems
    execHistoryPosRef.current = 0
  }, [historyItems])

  const onQuickHistoryAccess = () => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects.current

    const position = editor.getPosition()
    if (
      position?.column !== 1 ||
      position?.lineNumber !== 1 ||
      // @ts-ignore
      editor.getContribution('editor.contrib.suggestController')?.model?.state
    )
      return

    if (execHistoryRef.current[execHistoryPosRef.current]) {
      const command =
        execHistoryRef.current[execHistoryPosRef.current].command || ''
      editor.setValue(command)
      execHistoryPosRef.current++
    }
  }

  const resetHistoryPos = () => {
    execHistoryPosRef.current = 0
  }

  const isHistoryScrolled = () =>
    execHistoryPosRef.current >= execHistoryRef.current.length

  return {
    onQuickHistoryAccess,
    resetHistoryPos,
    isHistoryScrolled,
  }
}
