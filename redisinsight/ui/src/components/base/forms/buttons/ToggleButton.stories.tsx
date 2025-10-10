// Toggle Button Stories
import { ToggleButton } from './ToggleButton'
import { fn } from 'storybook/test'
import { Meta, StoryObj } from '@storybook/react-vite'

const toggleMeta = {
  title: 'UI/Buttons/Toggle Button',
  component: ToggleButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof ToggleButton>

export default toggleMeta

type ToggleStory = StoryObj<typeof toggleMeta>

export const ToggleOff: ToggleStory = {
  args: {
    children: 'Toggle Off',
    pressed: false,
    'aria-label': 'Toggle feature',
  },
}

export const ToggleOn: ToggleStory = {
  args: {
    children: 'Toggle On',
    pressed: true,
    'aria-label': 'Toggle feature',
  },
}

export const ToggleDisabled: ToggleStory = {
  args: {
    children: 'Toggle Disabled',
    pressed: false,
    disabled: true,
    'aria-label': 'Toggle feature',
  },
}

export const ToggleDisabledOn: ToggleStory = {
  args: {
    children: 'Toggle Disabled On',
    pressed: true,
    disabled: true,
    'aria-label': 'Toggle feature',
  },
}
