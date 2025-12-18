import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CommandGroup, KeyTypes } from 'uiSrc/constants'
import GroupBadge from './GroupBadge'

const meta: Meta<typeof GroupBadge> = {
  component: GroupBadge,
  args: {
    type: KeyTypes.String,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const KeyTypeBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <GroupBadge type={KeyTypes.String} />
      <GroupBadge type={KeyTypes.Hash} />
      <GroupBadge type={KeyTypes.List} />
      <GroupBadge type={KeyTypes.Set} />
      <GroupBadge type={KeyTypes.ZSet} />
      <GroupBadge type={KeyTypes.Stream} />
      <GroupBadge type={KeyTypes.JSON} />
    </div>
  ),
}

export const CommandGroupBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <GroupBadge type={CommandGroup.Generic} />
      <GroupBadge type={CommandGroup.Bitmap} />
      <GroupBadge type={CommandGroup.Cluster} />
      <GroupBadge type={CommandGroup.Connection} />
      <GroupBadge type={CommandGroup.Geo} />
      <GroupBadge type={CommandGroup.PubSub} />
      <GroupBadge type={CommandGroup.Scripting} />
      <GroupBadge type={CommandGroup.Transactions} />
      <GroupBadge type={CommandGroup.Server} />
      <GroupBadge type={CommandGroup.SortedSet} />
      <GroupBadge type={CommandGroup.HyperLogLog} />
    </div>
  ),
}
