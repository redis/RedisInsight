import React, { useEffect, useState } from 'react'
import type { Meta, StoryObj, StoryContext } from '@storybook/react-vite'
import { useDispatch } from 'react-redux'

import { MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import {
  getRedisCommands,
  getRedisCommandsSuccess,
} from 'uiSrc/slices/app/redis-commands'
import MonacoEnvironmentInitializer from 'uiSrc/components/MonacoEnvironmentInitializer/MonacoEnvironmentInitializer'
import MonacoLanguages from 'uiSrc/components/monaco-laguages'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'

import QueryWrapper from './QueryWrapper'

/**
 * Decorator to initialize Monaco environment and Redis commands.
 * When `parameters.loadingState` is true, dispatches the loading action
 * instead of loading commands to simulate the loading state.
 */
const WithMonacoSetup = (Story: React.ComponentType, context: StoryContext) => {
  const isLoading = context.parameters?.loadingState === true

  const MonacoSetup = () => {
    const dispatch = useDispatch()

    useEffect(() => {
      if (isLoading) {
        dispatch(getRedisCommands())
      } else {
        // @ts-ignore - MOCK_COMMANDS_SPEC type differences are fine for Monaco
        dispatch(getRedisCommandsSuccess(MOCK_COMMANDS_SPEC))
      }
    }, [dispatch])

    return (
      <div
        style={{
          width: '1000px',
          height: '400px',
          display: 'flex',
          margin: '0 auto',
        }}
      >
        <MonacoEnvironmentInitializer />
        <MonacoLanguages />
        <Story />
      </div>
    )
  }

  return <MonacoSetup />
}

const meta: Meta<typeof QueryWrapper> = {
  component: QueryWrapper,
  tags: ['autodocs'],
  decorators: [WithMonacoSetup],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Workbench Query Editor with full autocomplete, command history, DSL syntax widget, raw/group mode toggle, and tutorials.',
      },
      story: {
        inline: false,
        iframeHeight: 400,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default empty editor with full actions (tutorials + raw/group/run).
 */
export const Default: Story = {
  render: () => {
    const [query, setQuery] = useState('')
    return (
      <QueryWrapper
        query={query}
        setQuery={setQuery}
        activeMode={RunQueryMode.ASCII}
        resultsMode={ResultsMode.Default}
        setQueryEl={() => {}}
        onSubmit={(value) => {
          // eslint-disable-next-line no-console
          console.log('Submit:', value)
        }}
        onQueryChangeMode={() => {}}
        onChangeGroupMode={() => {}}
      />
    )
  },
}

/**
 * Editor with lite actions (Run + Clear only, no tutorials/mode toggles).
 */
export const LiteActions: Story = {
  name: 'Lite actions mode',
  render: () => {
    const [query, setQuery] = useState('')
    return (
      <QueryWrapper
        query={query}
        setQuery={setQuery}
        activeMode={RunQueryMode.ASCII}
        setQueryEl={() => {}}
        onSubmit={(value) => {
          // eslint-disable-next-line no-console
          console.log('Submit:', value)
        }}
        onQueryChangeMode={() => {}}
        onChangeGroupMode={() => {}}
        queryProps={{ useLiteActions: true }}
      />
    )
  },
}

/**
 * Editor pre-populated with a multi-line query.
 */
export const WithQuery: Story = {
  name: 'With pre-filled query',
  render: () => {
    const [query, setQuery] = useState(
      'FT.CREATE idx:bikes_vss ON HASH PREFIX 1 "bikes:"\n' +
        'SCHEMA "model" TEXT NOSTEM SORTABLE\n' +
        '"brand" TEXT NOSTEM SORTABLE\n' +
        '"price" NUMERIC SORTABLE',
    )
    return (
      <QueryWrapper
        query={query}
        setQuery={setQuery}
        activeMode={RunQueryMode.ASCII}
        resultsMode={ResultsMode.Default}
        setQueryEl={() => {}}
        onSubmit={(value) => {
          // eslint-disable-next-line no-console
          console.log('Submit:', value)
        }}
        onQueryChangeMode={() => {}}
        onChangeGroupMode={() => {}}
      />
    )
  },
}

/**
 * Loading state while Redis commands are being fetched.
 */
export const Loading: Story = {
  parameters: {
    loadingState: true,
  },
  render: () => (
    <QueryWrapper
      query=""
      setQuery={() => {}}
      activeMode={RunQueryMode.ASCII}
      setQueryEl={() => {}}
      onSubmit={() => {}}
      onQueryChangeMode={() => {}}
      onChangeGroupMode={() => {}}
    />
  ),
}
