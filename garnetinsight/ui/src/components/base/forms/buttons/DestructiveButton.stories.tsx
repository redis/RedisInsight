// Destructive Button Stories
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DestructiveButton } from './DestructiveButton'

const destructiveMeta = {
  component: DestructiveButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof DestructiveButton>
export default destructiveMeta

type DestructiveStory = StoryObj<typeof destructiveMeta>

export const DestructiveDefault: DestructiveStory = {
  args: {
    children: 'Delete',
  },
}

export const DestructiveSmall: DestructiveStory = {
  args: {
    children: 'Remove',
    size: 'small',
  },
}

export const DestructiveDisabled: DestructiveStory = {
  args: {
    children: 'Cannot Delete',
    disabled: true,
  },
}

export const DestructiveLoading: DestructiveStory = {
  args: {
    children: 'Deleting...',
    loading: true,
  },
}
