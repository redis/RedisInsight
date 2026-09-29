import React, { useEffect, useMemo, useRef } from 'react'
import { ICommandLogEntry } from 'uiSrc/slices/interfaces'
import { useTranslation } from 'uiSrc/i18n'
import * as S from '../CommandLogPanel.styles'

export interface Props {
  entries: ICommandLogEntry[]
  isAutoScrollEnabled: boolean
}

/**
 * Consecutive entries belonging to the same operation are merged into a single
 * group as long as they arrive close together in time.
 *
 * A single click in the Browser can send dozens of commands (loading the key
 * list alone issues a `SCAN` plus one pipeline per inspected key), so grouping
 * keeps the panel readable without hiding any command. The time gap is what
 * separates two consecutive clicks on the same kind of action.
 */
const GROUP_MAX_GAP_MS = 300

interface CommandLineItem {
  id: string
  commandLine: string
  /** How many times this exact command line was sent back to back. */
  count: number
}

interface Group {
  id: string
  operation: string
  time: number
  /** Total number of commands in the group, collapsed ones included. */
  total: number
  lines: CommandLineItem[]
}

const formatTime = (time: number): string => {
  const date = new Date(time)

  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}

export const buildCommandLogGroups = (entries: ICommandLogEntry[]): Group[] => {
  const groups: Group[] = []
  let previousTime = 0

  entries.forEach((entry) => {
    let group = groups[groups.length - 1]

    const continuesPrevious =
      group &&
      group.operation === (entry.operation ?? '') &&
      entry.time - previousTime <= GROUP_MAX_GAP_MS

    if (!continuesPrevious) {
      group = {
        id: entry.id,
        operation: entry.operation ?? '',
        time: entry.time,
        total: 0,
        lines: [],
      }
      groups.push(group)
    }

    group.total += 1
    previousTime = entry.time

    const line = group.lines[group.lines.length - 1]

    if (line && line.commandLine === entry.commandLine) {
      line.count += 1
      return
    }

    group.lines.push({
      id: entry.id,
      commandLine: entry.commandLine,
      count: 1,
    })
  })

  return groups
}

/**
 * Renders the recorded commands grouped by operation, oldest first.
 *
 * Entries are plain text on purpose: the panel exists to be read and copied
 * while learning which command a given UI action produces.
 */
const CommandLogList = ({ entries, isAutoScrollEnabled }: Props) => {
  const { t } = useTranslation()
  const listRef = useRef<HTMLDivElement>(null)
  const groups = useMemo(() => buildCommandLogGroups(entries), [entries])

  useEffect(() => {
    if (!isAutoScrollEnabled || !listRef.current) {
      return
    }

    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [groups, isAutoScrollEnabled])

  return (
    <S.List ref={listRef} data-testid="command-log-list">
      {groups.map((group) => (
        <S.Group key={group.id} data-testid="command-log-group">
          <S.GroupHeader>
            <S.Time>{formatTime(group.time)}</S.Time>
            <S.Operation>
              {group.operation || t('browser.commandLog.unknownOperation')}
            </S.Operation>
            <S.Count data-testid="command-log-group-count">
              {group.total}
            </S.Count>
          </S.GroupHeader>
          <S.Commands>
            {group.lines.map((line) => (
              <S.CommandRow key={line.id} data-testid="command-log-entry">
                <S.CommandLine>{line.commandLine}</S.CommandLine>
                {line.count > 1 && <S.Repeat>×{line.count}</S.Repeat>}
              </S.CommandRow>
            ))}
          </S.Commands>
        </S.Group>
      ))}
    </S.List>
  )
}

export default CommandLogList
