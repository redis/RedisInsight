import React, { useEffect } from 'react'
import type { Meta, StoryObj, StoryContext } from '@storybook/react-vite'
import { useDispatch } from 'react-redux'
import { fn } from 'storybook/test'
import { MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import { RunQueryMode } from 'uiSrc/slices/interfaces/workbench'
import { commandExecutionUIFactory } from 'uiSrc/mocks/factories/workbench/commandExectution.factory'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { DBInstanceFactory } from 'uiSrc/mocks/factories/database/DBInstance.factory'
import { setConnectedInstanceSuccess } from 'uiSrc/slices/instances/instances'
import { getRedisCommandsSuccess } from 'uiSrc/slices/app/redis-commands'
import { QueryResultsProvider } from '../context/query-results.context'
import QueryResults from './QueryResults'

const WithDatabaseSetup = (
  Story: React.ComponentType,
  _context: StoryContext,
) => {
  const Setup = () => {
    const dispatch = useDispatch()

    useEffect(() => {
      const instance = DBInstanceFactory.build({
        modules: [
          {
            name: RedisDefaultModules.Search,
            version: 20800,
            semanticVersion: '2.8.0',
          },
          {
            name: RedisDefaultModules.ReJSON,
            version: 20600,
            semanticVersion: '2.6.0',
          },
        ],
      })

      dispatch(setConnectedInstanceSuccess(instance))
      // @ts-ignore - MOCK_COMMANDS_SPEC type differences are fine for stories
      dispatch(getRedisCommandsSuccess(MOCK_COMMANDS_SPEC))
    }, [dispatch])

    return (
      <QueryResultsProvider telemetry={{}}>
        <div
          style={{
            height: '100%',
            // display: 'flex',
            flexDirection: 'column',
            // padding: '16px',
            // boxSizing: 'border-box',
          }}
        >
          <Story />
        </div>
      </QueryResultsProvider>
    )
  }

  return <Setup />
}

const meta: Meta<typeof QueryResults> = {
  component: QueryResults,
  tags: ['autodocs'],
  decorators: [WithDatabaseSetup],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Displays a list of query execution results as cards with a Clear Results header. Supports loading state, empty placeholder, and per-card actions (re-run, delete, open, profile).',
      },
    },
  },
  args: {
    isResultsLoaded: true,
    items: [],
    clearing: false,
    processing: false,
    activeMode: RunQueryMode.ASCII,
    scrollDivRef: React.createRef(),
    onQueryReRun: fn(),
    onQueryDelete: fn(),
    onAllQueriesDelete: fn(),
    onQueryOpen: fn(),
    onQueryProfile: fn(),
    onToggleOpen: fn(),
  },
}

export default meta

type Story = StoryObj<typeof meta>

const mockItems = [
  commandExecutionUIFactory.build({
    id: '1',
    command: 'FT.SEARCH idx *',
    isOpen: true,
    loading: false,
    result: [{ response: 'OK', status: CommandExecutionStatus.Success }],
  }),
  commandExecutionUIFactory.build({
    id: '2',
    command: 'SET key value',
    isOpen: false,
    loading: false,
    result: [{ response: 'OK', status: CommandExecutionStatus.Success }],
  }),
  commandExecutionUIFactory.build({
    id: '3',
    command: 'GET key',
    isOpen: false,
    loading: false,
    result: [{ response: '"value"', status: CommandExecutionStatus.Success }],
  }),
]

export const Default: Story = {
  args: {
    items: mockItems,
  },
}

export const Loading: Story = {
  args: {
    isResultsLoaded: false,
    items: [],
  },
}

export const Empty: Story = {
  args: {
    items: [],
    noResultsPlaceholder: (
      <div style={{ padding: '24px', textAlign: 'center', opacity: 0.6 }}>
        No query results yet. Run a query to see results here.
      </div>
    ),
  },
}

export const Clearing: Story = {
  args: {
    items: mockItems,
    clearing: true,
  },
}

export const Processing: Story = {
  args: {
    items: mockItems,
    processing: true,
  },
}
