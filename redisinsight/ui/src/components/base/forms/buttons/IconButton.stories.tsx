// Icon Button Stories
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton } from './IconButton'

const iconMeta = {
  title: 'UI/Buttons/Icon Button',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof IconButton>
export default iconMeta
type IconStory = StoryObj<typeof iconMeta>

export const IconDefault: IconStory = {
  args: {
    icon: 'ActiveActiveIcon',
    'aria-label': 'Add',
  },
}

export const IconSmall: IconStory = {
  args: {
    icon: 'EditIcon',
    size: 'S',
    'aria-label': 'Edit',
  },
}

export const IconMedium: IconStory = {
  args: {
    icon: 'DeleteIcon',
    size: 'M',
    'aria-label': 'Delete',
  },
}

export const IconLarge: IconStory = {
  args: {
    icon: 'InfoIcon',
    size: 'L',
    'aria-label': 'Settings',
  },
}

export const IconDisabled: IconStory = {
  args: {
    icon: 'ActiveActiveIcon',
    disabled: true,
    'aria-label': 'Close',
  },
}
