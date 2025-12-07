// Empty Button Stories
import { EmptyButton } from './EmptyButton'
import { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

const emptyMeta = {
  component: EmptyButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof EmptyButton>
export default emptyMeta

type EmptyStory = StoryObj<typeof emptyMeta>

export const EmptyDefault: EmptyStory = {
  args: {
    children: 'Empty Button',
  },
}

export const EmptySmall: EmptyStory = {
  args: {
    children: 'Small Empty',
    size: 'small',
  },
}

export const EmptyMedium: EmptyStory = {
  args: {
    children: 'Medium Empty',
    size: 'medium',
  },
}

export const EmptyLarge: EmptyStory = {
  args: {
    children: 'Large Empty',
    size: 'large',
  },
}

export const EmptyDisabled: EmptyStory = {
  args: {
    children: 'Disabled Empty',
    disabled: true,
  },
}
