import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useDispatch } from 'react-redux'

import { MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import { getRedisCommandsSuccess } from 'uiSrc/slices/app/redis-commands'
import MonacoEnvironmentInitializer from 'uiSrc/components/MonacoEnvironmentInitializer/MonacoEnvironmentInitializer'
import MonacoLanguages from 'uiSrc/components/monaco-laguages'

import { QueryEditorWrapper } from './QueryEditorWrapper'

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

const meta: Meta<typeof QueryEditorWrapper> = {
  component: QueryEditorWrapper,
  tags: ['autodocs'],
  decorators: [withMonacoSetup],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Vector Search Query Editor with Editor/Library toggle, Monaco editor with RQE autocomplete, and Run action button.',
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
      <QueryEditorWrapper
        query={query}
        setQuery={setQuery}
        onSubmit={(value) => {
          // eslint-disable-next-line no-console
          console.log('Submit:', value)
        }}
      />
    )
  },
}

/**
 * Editor pre-populated with a KNN search query.
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
      'FT.SEARCH idx:bikes "*=>[KNN 10 @vector $blob]" PARAMS 2 blob "..." DIALECT 2',
    )
    return (
      <QueryEditorWrapper
        query={query}
        setQuery={setQuery}
        onSubmit={(value) => {
          // eslint-disable-next-line no-console
          console.log('Submit:', value)
        }}
      />
    )
  },
}
