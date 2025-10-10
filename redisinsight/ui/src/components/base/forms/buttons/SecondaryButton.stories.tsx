// Secondary Button Stories
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SecondaryButton } from './SecondaryButton'
import { InfoIcon } from 'uiSrc/components/base/icons'

const secondaryMeta = {
  title: 'Components/Base/Forms/Buttons/Secondary Button',
  component: SecondaryButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof SecondaryButton>
export default secondaryMeta
type SecondaryStory = StoryObj<typeof secondaryMeta>

export const SecondaryDefault: SecondaryStory = {
  args: {
    children: 'Secondary Button',
  },
}

export const SecondaryFilled: SecondaryStory = {
  args: {
    children: 'Secondary Filled',
    filled: true,
  },
}

export const SecondaryInverted: SecondaryStory = {
  args: {
    children: 'Secondary Inverted',
    inverted: true,
  },
}

export const SecondarySmall: SecondaryStory = {
  args: {
    children: 'Small Secondary',
    size: 'small',
  },
}

export const SecondaryDisabled: SecondaryStory = {
  args: {
    children: 'Disabled Secondary',
    disabled: true,
  },
}

export const SecondaryLoading: SecondaryStory = {
  args: {
    children: 'Loading Secondary',
    loading: true,
  },
}

export const SecondaryIcon: SecondaryStory = {
  args: {
    children: 'Secondary Icon Default',
    icon: InfoIcon,
  },
}

export const SecondaryIconRight: SecondaryStory = {
  args: {
    children: 'Secondary Icon Right',
    icon: InfoIcon,
    iconSide: 'right',
  },
}
