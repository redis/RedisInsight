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
  args: {
    onSubmit: fn(),
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Vector Search Query Editor with Editor/Library toggle, Monaco editor
with RQE autocomplete, and Run action button.

### Onboarding suggestions

When the editor is **empty** and receives **focus**, a suggestions panel
is shown with a predefined list of RQE query templates:

| Command | Description |
|---------|-------------|
| \`FT.SEARCH\` | Find documents by text or filters |
| \`FT.AGGREGATE\` | Group and summarize results |
| \`FT.SUGGET\` | Retrieve autocomplete suggestions |
| \`FT.SPELLCHECK\` | Suggest corrections for typos |
| \`FT.EXPLAIN\` | See execution plan |
| \`FT.PROFILE\` | Analyze performance |
| \`FT._LIST\` | View index schema and stats |

Each suggestion shows the **query detail first** (\`detail\` property),
and users can expand the **full documentation** via the Monaco details
panel.

### Index-aware autocomplete

Templates are **index-aware**: when available indexes exist, the first
index name is **preselected** in snippet tab-stop placeholders. As the
user types, the selected index is used in suggestions.

### How it works

The behaviour is driven by \`VectorSearchEditor\`'s \`onSetup\` callback:

1. On mount (and on every subsequent focus of an empty editor),
   \`getOnboardingSuggestions()\` builds the 7 template completion items.
2. The items are set via \`completions.setSuggestionsData()\` and the
   suggest widget is triggered.
3. Once the user picks a template or starts typing, the normal
   autocomplete flow takes over with all Redis commands available.

This behaviour is **unique to Vector Search** — the Workbench editor
does not auto-show suggestions.`,
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
 * Default empty editor — demonstrates the **onboarding** flow.
 *
 * 1. Click into the editor area.
 * 2. A suggestions panel appears with 7 predefined FT.* templates,
 *    each showing its description as the detail text.
 * 3. Expand the documentation panel to see the full docs for each
 *    command.
 * 4. Pick a template — the snippet is inserted with the preselected
 *    index (if available) and autocomplete continues normally.
 * 5. All Redis commands remain available if you start typing
 *    something else.
 */
export const Default: Story = {
  render: (args) => {
    const [query, setQuery] = useState('')
    return <QueryEditorWrapper {...args} query={query} setQuery={setQuery} />
  },
}

/**
 * Editor pre-populated with a KNN search query.
 *
 * Because the editor is not blank, the onboarding suggestions popup
 * does **not** appear automatically — regular code completion is used
 * instead.
 */
export const WithQuery: Story = {
  name: 'With pre-filled query',
  render: (args) => {
    const [query, setQuery] = useState(
      'FT.SEARCH idx:bikes "*=>[KNN 10 @vector $blob]" PARAMS 2 blob "..." DIALECT 2',
    )
    return <QueryEditorWrapper {...args} query={query} setQuery={setQuery} />
  },
}

/**
 * Loading state while Redis commands are being fetched.
 */
export const Loading: Story = {
  parameters: {
    loadingState: true,
  },
  render: (args) => {
    const [query, setQuery] = useState('')
    return <QueryEditorWrapper {...args} query={query} setQuery={setQuery} />
  },
}
