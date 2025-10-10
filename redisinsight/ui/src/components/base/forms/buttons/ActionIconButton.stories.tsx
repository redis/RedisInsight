// Action Icon Button Stories
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionIconButton } from './ActionIconButton'
import { ActiveActiveIcon } from 'uiSrc/components/base/icons'

const actionIconMeta = {
  title: 'Components/Base/Forms/Buttons/Action Icon Button',
  component: ActionIconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof ActionIconButton>

export default actionIconMeta
type ActionIconStory = StoryObj<typeof actionIconMeta>

export const ActionIconDefault: ActionIconStory = {
  args: {
    icon: ActiveActiveIcon,
    'aria-label': 'More actions',
  },
}

export const ActionIconSmall: ActionIconStory = {
  args: {
    icon: ActiveActiveIcon,
    size: 'S',
    'aria-label': 'Filter',
  },
}

export const ActionIconDisabled: ActionIconStory = {
  args: {
    icon: ActiveActiveIcon,
    disabled: true,
    'aria-label': 'Search',
  },
}
