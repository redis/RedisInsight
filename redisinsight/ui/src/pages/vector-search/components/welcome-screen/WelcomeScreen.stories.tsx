import type { Meta, StoryObj } from '@storybook/react-vite'

import { WelcomeScreen } from './WelcomeScreen'

const meta: Meta<typeof WelcomeScreen> = {
  component: WelcomeScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Welcome screen for Vector Search feature. Displays feature cards and action buttons.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    // eslint-disable-next-line no-alert
    onTrySampleDataClick: () => alert('Try with sample data clicked!'),
    // eslint-disable-next-line no-alert
    onUseMyDatabaseClick: () => alert('Use data from my database clicked!'),
  },
}

export const UseMyDatabaseDisabled: Story = {
  name: '"Use data from my database" disabled',
  args: {
    // eslint-disable-next-line no-alert
    onTrySampleDataClick: () => alert('Try with sample data clicked!'),
    useMyDatabaseDisabled: {
      tooltip: "You don't have any data in your database yet",
    },
  },
}
