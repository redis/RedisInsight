import React, { useEffect, useState } from 'react'
import type { Meta, StoryObj, StoryContext } from '@storybook/react-vite'
import { useDispatch } from 'react-redux'
import { fn } from 'storybook/test'

import { MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import {
  getRedisCommands,
  getRedisCommandsSuccess,
} from 'uiSrc/slices/app/redis-commands'
import MonacoEnvironmentInitializer from 'uiSrc/components/MonacoEnvironmentInitializer/MonacoEnvironmentInitializer'
import MonacoLanguages from 'uiSrc/components/monaco-laguages'

import { QueryEditorWrapper } from './QueryEditorWrapper'

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

const meta: Meta<typeof QueryEditorWrapper> = {
  component: QueryEditorWrapper,
  tags: ['autodocs'],
  decorators: [WithMonacoSetup],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Vector Search Query Editor with Editor/Library toggle, Monaco editor with RQE autocomplete, and Run action button.',
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
 * Default empty editor.
 */
export const Default: Story = {
  render: () => {
    const [query, setQuery] = useState('')
    return (
      <QueryEditorWrapper query={query} setQuery={setQuery} onSubmit={fn()} />
    )
  },
}

/**
 * Editor pre-populated with a KNN search query.
 */
export const WithQuery: Story = {
  name: 'With pre-filled query',
  render: () => {
    const [query, setQuery] = useState(
      'FT.SEARCH idx:bikes "*=>[KNN 10 @vector $blob]" PARAMS 2 blob "..." DIALECT 2',
    )
    return (
      <QueryEditorWrapper query={query} setQuery={setQuery} onSubmit={fn()} />
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
  render: () => {
    const [query, setQuery] = useState('')
    return (
      <QueryEditorWrapper query={query} setQuery={setQuery} onSubmit={fn()} />
    )
  },
}
