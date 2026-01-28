import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useDispatch } from 'react-redux'
import { CommandView } from './index'
import { MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import { getRedisCommandsSuccess } from 'uiSrc/slices/app/redis-commands'
import { RiAccordion } from 'uiSrc/components/base/display/accordion/RiAccordion'
import MonacoEnvironmentInitializer from 'uiSrc/components/MonacoEnvironmentInitializer/MonacoEnvironmentInitializer'
import MonacoLanguages from 'uiSrc/components/monaco-laguages'

// Decorator to initialize Monaco environment and Redis commands for syntax highlighting
const withMonacoSetup = (Story: React.ComponentType) => {
  const MonacoSetup = () => {
    const dispatch = useDispatch()

    React.useEffect(() => {
      // Initialize Redis commands with mock data so MonacoLanguages can register the language
      // @ts-ignore - MOCK_COMMANDS_SPEC has some type differences but works for Monaco language registration
      dispatch(getRedisCommandsSuccess(MOCK_COMMANDS_SPEC))
    }, [dispatch])

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <MonacoEnvironmentInitializer />
        <MonacoLanguages />
        <Story />
      </div>
    )
  }

  return <MonacoSetup />
}

const meta: Meta<typeof CommandView> = {
  component: CommandView,
  parameters: {},
  tags: ['autodocs'],
  decorators: [withMonacoSetup],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 350,
      },
    },
  },
  args: {
    command: `FT.CREATE idx:bikes_vss ON HASH PREFIX 1 "bikes:"
    SCHEMA "model" TEXT NOSTEM SORTABLE "brand" TEXT NOSTEM SORTABLE
    "price" NUMERIC SORTABLE "type" TAG`,
  },
}

export const WithLineNumbers: Story = {
  name: 'With line numbers enabled',
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 350,
      },
    },
  },
  args: {
    command: `FT.CREATE idx:bikes_vss
    ON HASH
        PREFIX 1 "bikes:"
    SCHEMA
      "model" TEXT NOSTEM SORTABLE
      "brand" TEXT NOSTEM SORTABLE
      "price" NUMERIC SORTABLE
      "type" TAG
      "material" TAG
      "weight" NUMERIC SORTABLE
      "description_embeddings" VECTOR "FLAT" 10
        "TYPE" FLOAT32
        "DIM" 768
        "DISTANCE_METRIC" "L2"
        "INITIAL_CAP" 111
        "BLOCK_SIZE"  111`,
    showLineNumbers: true,
  },
}

export const FixedHeightWithScrolling: Story = {
  name: 'Fixed height with inline scrolling (composition with an accordion)',
  render: (args) => (
    <div style={{ padding: '16px', width: '100%' }}>
      <style>
        {`
          #ri-accordion-command-view-example [data-testid="ri-accordion-body-command-view-example"] {
            padding: 0;
          }
        `}
      </style>
      <RiAccordion
        id="command-view-example"
        label="Create Index command"
        defaultOpen={true}
      >
        <div style={{ width: '100%', height: '200px' }}>
          <CommandView {...args} />
        </div>
      </RiAccordion>
    </div>
  ),
  args: {
    command: `FT.CREATE idx:bikes_vss
    ON HASH
        PREFIX 1 "bikes:"
    SCHEMA
      "model" TEXT NOSTEM SORTABLE
      "brand" TEXT NOSTEM SORTABLE
      "price" NUMERIC SORTABLE
      "type" TAG
      "material" TAG
      "weight" NUMERIC SORTABLE
      "description_embeddings" VECTOR "FLAT" 10
        "TYPE" FLOAT32
        "DIM" 768
        "DISTANCE_METRIC" "L2"
        "INITIAL_CAP" 111
        "BLOCK_SIZE"  111`,
  },
}
