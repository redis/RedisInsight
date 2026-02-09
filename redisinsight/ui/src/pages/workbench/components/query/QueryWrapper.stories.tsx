import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useDispatch } from 'react-redux'

import { MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import { getRedisCommandsSuccess } from 'uiSrc/slices/app/redis-commands'
import MonacoEnvironmentInitializer from 'uiSrc/components/MonacoEnvironmentInitializer/MonacoEnvironmentInitializer'
import MonacoLanguages from 'uiSrc/components/monaco-laguages'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'

import QueryWrapper from './QueryWrapper'

// Decorator to initialize Monaco environment and Redis commands
const withMonacoSetup = (Story: React.ComponentType) => {
  const MonacoSetup = () => {
    const dispatch = useDispatch()

    React.useEffect(() => {
      // @ts-ignore - MOCK_COMMANDS_SPEC type differences are fine for Monaco
      dispatch(getRedisCommandsSuccess(MOCK_COMMANDS_SPEC))
    }, [dispatch])

    return (
      <div style={{ width: '100%', height: '400px', display: 'flex' }}>
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
  decorators: [withMonacoSetup],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Workbench Query Editor with full autocomplete, command history, DSL syntax widget, raw/group mode toggle, and tutorials.',
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
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 400,
      },
    },
  },
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
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 400,
      },
    },
  },
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
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 400,
      },
    },
  },
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
