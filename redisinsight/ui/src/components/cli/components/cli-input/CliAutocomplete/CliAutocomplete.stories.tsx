import type { Meta, StoryObj } from '@storybook/react-vite'

import CliAutocomplete from './index'

const cliAutocompleteMeta = {
  component: CliAutocomplete,
  args: {
    commandName: 'scan',
    provider: 'redis',
    arguments: [
      {
        name: 'cursor',
        type: 'integer',
      },
      {
        token: 'MATCH',
        name: 'pattern',
        type: 'pattern',
        optional: true,
      },
      {
        token: 'COUNT',
        name: 'count',
        type: 'integer',
        optional: true,
      },
      {
        token: 'TYPE',
        name: 'type',
        type: 'string',
        optional: true,
      },
    ],
  },
} satisfies Meta<typeof CliAutocomplete>

export default cliAutocompleteMeta

type Story = StoryObj<typeof cliAutocompleteMeta>

export const Default: Story = {
  args: {
    wordsTyped: 5,
  },
}
