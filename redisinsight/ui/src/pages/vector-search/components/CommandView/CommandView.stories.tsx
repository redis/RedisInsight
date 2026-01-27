import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useDispatch } from 'react-redux'
import { CommandView } from './index'
import { MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import { getRedisCommandsSuccess } from 'uiSrc/slices/app/redis-commands'
import { RiAccordion } from 'uiSrc/components/base/display/accordion/RiAccordion'

// Decorator to initialize Redis commands for Monaco syntax highlighting
const withRedisCommands = (Story: React.ComponentType) => {
  const RedisCommandsInitializer = () => {
    const dispatch = useDispatch()

    React.useEffect(() => {
      // Initialize Redis commands with mock data so MonacoLanguages can register the language
      // @ts-ignore - MOCK_COMMANDS_SPEC has some type differences but works for Monaco language registration
      dispatch(getRedisCommandsSuccess(MOCK_COMMANDS_SPEC))
    }, [dispatch])

    return <Story />
  }

  return <RedisCommandsInitializer />
}

// Decorator to fill available space
const withFlexContainer = (Story: React.ComponentType) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
    }}
  >
    <Story />
  </div>
)

const meta: Meta<typeof CommandView> = {
  component: CommandView,
  parameters: {},
  tags: ['autodocs'],
  decorators: [withRedisCommands],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [withRedisCommands, withFlexContainer],
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
  decorators: [withRedisCommands, withFlexContainer],
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
  decorators: [withRedisCommands],
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
