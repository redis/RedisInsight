// Primary Button Stories
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PrimaryButton } from './PrimaryButton'

const primaryMeta = {
  title: 'Components/Base/Forms/Buttons/Primary Button',
  component: PrimaryButton,
  tags: ['autodocs'],
  args: { onClick: fn() },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PrimaryButton>

export default primaryMeta
type PrimaryStory = StoryObj<typeof primaryMeta>

export const PrimaryDefault: PrimaryStory = {
  args: {
    children: 'Primary Button',
  },
}

export const PrimarySmall: PrimaryStory = {
  args: {
    children: 'Small Primary',
    size: 'small',
  },
}

export const PrimaryLarge: PrimaryStory = {
  args: {
    children: 'Large Primary',
    size: 'large',
  },
}

export const PrimaryDisabled: PrimaryStory = {
  args: {
    children: 'Disabled Primary',
    disabled: true,
  },
}

export const PrimaryLoading: PrimaryStory = {
  args: {
    children: 'Loading Primary',
    loading: true,
  },
}
