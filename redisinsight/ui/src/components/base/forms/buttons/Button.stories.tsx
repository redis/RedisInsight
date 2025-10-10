// Base Button Stories
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './index'

const baseMeta = {
  title: 'Components/Base/Forms/Buttons/Base Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof Button>

export default baseMeta
type BaseStory = StoryObj<typeof baseMeta>

export const Default: BaseStory = {
  args: {
    children: 'Base Button',
  },
}

export const Small: BaseStory = {
  args: {
    children: 'Small Button',
    size: 'small',
  },
}

export const Medium: BaseStory = {
  args: {
    children: 'Medium Button',
    size: 'medium',
  },
}

export const Large: BaseStory = {
  args: {
    children: 'Large Button',
    size: 'large',
  },
}

export const Disabled: BaseStory = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
}

export const Loading: BaseStory = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
}
