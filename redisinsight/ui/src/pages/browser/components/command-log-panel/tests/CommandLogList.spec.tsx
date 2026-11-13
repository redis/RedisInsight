import React from 'react'
import { render, screen, cleanup } from 'uiSrc/utils/test-utils'
import { ICommandLogEntry } from 'uiSrc/slices/interfaces'
import CommandLogList, {
  buildCommandLogGroups,
} from '../components/CommandLogList'

const BASE_TIME = 1_700_000_000_000

let sequence = 0

const entry = (over: Partial<ICommandLogEntry> = {}): ICommandLogEntry => {
  sequence += 1

  return {
    id: `entry-${sequence}`,
    time: BASE_TIME,
    databaseId: 'instance-1',
    db: 0,
    source: 'sendCommand',
    command: 'SCAN',
    args: [],
    commandLine: 'scan 0',
    truncated: false,
    ...over,
  }
}

describe('buildCommandLogGroups', () => {
  it('groups consecutive entries that belong to the same operation', () => {
    const groups = buildCommandLogGroups([
      entry({ operation: 'Load key list', commandLine: 'dbsize' }),
      entry({ operation: 'Load key list', commandLine: 'scan 0' }),
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0].operation).toBe('Load key list')
    expect(groups[0].total).toBe(2)
    expect(groups[0].lines).toHaveLength(2)
  })

  it('starts a new group when the operation changes', () => {
    const groups = buildCommandLogGroups([
      entry({ operation: 'Load key list', commandLine: 'scan 0' }),
      entry({ operation: 'Load key value', commandLine: 'type foo' }),
    ])

    expect(groups.map((group) => group.operation)).toEqual([
      'Load key list',
      'Load key value',
    ])
  })

  it('starts a new group when the same operation happens later', () => {
    // Two separate clicks on the key list must not be merged into one group,
    // even though the operation label is identical.
    const groups = buildCommandLogGroups([
      entry({ operation: 'Load key list', commandLine: 'scan 0' }),
      entry({
        operation: 'Load key list',
        commandLine: 'scan 0',
        time: BASE_TIME + 5_000,
      }),
    ])

    expect(groups).toHaveLength(2)
  })

  it('collapses consecutive identical command lines and keeps the count', () => {
    const groups = buildCommandLogGroups([
      entry({ operation: 'Load key list', commandLine: 'ttl user:1' }),
      entry({ operation: 'Load key list', commandLine: 'ttl user:1' }),
      entry({ operation: 'Load key list', commandLine: 'ttl user:1' }),
    ])

    expect(groups[0].lines).toHaveLength(1)
    expect(groups[0].lines[0].count).toBe(3)
    expect(groups[0].total).toBe(3)
  })

  it('does not collapse identical lines that are not adjacent', () => {
    const groups = buildCommandLogGroups([
      entry({ operation: 'Load key list', commandLine: 'ttl user:1' }),
      entry({ operation: 'Load key list', commandLine: 'ttl user:2' }),
      entry({ operation: 'Load key list', commandLine: 'ttl user:1' }),
    ])

    expect(groups[0].lines.map((line) => line.count)).toEqual([1, 1, 1])
  })

  it('returns no groups for an empty log', () => {
    expect(buildCommandLogGroups([])).toEqual([])
  })
})

describe('CommandLogList', () => {
  afterEach(cleanup)

  it('renders the operation label and how many commands it produced', () => {
    render(
      <CommandLogList
        isAutoScrollEnabled={false}
        entries={[
          entry({ operation: 'Load key list', commandLine: 'dbsize' }),
          entry({ operation: 'Load key list', commandLine: 'scan 0' }),
        ]}
      />,
    )

    expect(screen.getByText('Load key list')).toBeInTheDocument()
    expect(screen.getByTestId('command-log-group-count')).toHaveTextContent('2')
  })

  it('renders every command line so nothing is hidden', () => {
    render(
      <CommandLogList
        isAutoScrollEnabled={false}
        entries={[
          entry({ operation: 'Load key list', commandLine: 'dbsize' }),
          entry({ operation: 'Load key list', commandLine: 'scan 0' }),
          entry({
            operation: 'Load key value',
            commandLine: 'type user:1',
          }),
        ]}
      />,
    )

    expect(screen.getByText('dbsize')).toBeInTheDocument()
    expect(screen.getByText('scan 0')).toBeInTheDocument()
    expect(screen.getByText('type user:1')).toBeInTheDocument()
    expect(screen.getAllByTestId('command-log-group')).toHaveLength(2)
  })

  it('shows a repeat badge when a command line is sent several times', () => {
    render(
      <CommandLogList
        isAutoScrollEnabled={false}
        entries={[
          entry({ operation: 'Load key list', commandLine: 'ttl user:1' }),
          entry({ operation: 'Load key list', commandLine: 'ttl user:1' }),
        ]}
      />,
    )

    expect(screen.getByText('×2')).toBeInTheDocument()
  })

  it('falls back to a readable label when an entry has no operation', () => {
    render(
      <CommandLogList
        isAutoScrollEnabled={false}
        entries={[entry({ operation: undefined, commandLine: 'ping' })]}
      />,
    )

    expect(screen.getByText('Unknown operation')).toBeInTheDocument()
  })
})
