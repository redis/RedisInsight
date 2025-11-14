import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { CommandGroup, KeyTypes } from 'uiSrc/constants'
import GroupBadge from './GroupBadge'

const meta: Meta<typeof GroupBadge> = {
  component: GroupBadge,
  args: {
    type: KeyTypes.String,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', border: '1px solid #ccc' }}>
        <h1>Group Badge</h1>
        <p>
          Component displays colored badges for Redis key types and command
          groups
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

// ============================================================================
// Stories
// ============================================================================

// ============================================================================
// Story: Key Types
// Shows badges for all Redis key types
// ============================================================================

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
  decorators: [
    (Story) => (
      <div>
        <h2>Key Types</h2>
        <p>All available Redis key type badges</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: Command Groups
// Shows badges for Redis command groups
// ============================================================================

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
  decorators: [
    (Story) => (
      <div>
        <h2>Command Groups</h2>
        <p>All available Redis command group badges</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: With Delete Button
// Shows badges with delete functionality
// ============================================================================

export const WithDeleteButton: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <GroupBadge type={KeyTypes.String} onDelete={fn()} />
      <GroupBadge type={KeyTypes.Hash} onDelete={fn()} />
      <GroupBadge type={KeyTypes.List} onDelete={fn()} />
      <GroupBadge type={CommandGroup.Generic} onDelete={fn()} />
      <GroupBadge type={CommandGroup.PubSub} onDelete={fn()} />
    </div>
  ),
  decorators: [
    (Story) => (
      <div>
        <h2>With Delete Button</h2>
        <p>Badges with delete button for removable filters/tags</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: Compressed Mode
// Shows badges in compact form without labels
// ============================================================================

export const Compressed: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <GroupBadge type={KeyTypes.String} compressed />
      <GroupBadge type={KeyTypes.Hash} compressed />
      <GroupBadge type={KeyTypes.List} compressed />
      <GroupBadge type={KeyTypes.Set} compressed />
      <GroupBadge type={KeyTypes.ZSet} compressed />
      <GroupBadge type={CommandGroup.Generic} compressed />
      <GroupBadge type={CommandGroup.PubSub} compressed />
    </div>
  ),
  decorators: [
    (Story) => (
      <div>
        <h2>Compressed Mode</h2>
        <p>Compact badges without text labels (color-only indicators)</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: Compressed with Delete
// Shows compact badges with delete button
// ============================================================================

export const CompressedWithDelete: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <GroupBadge type={KeyTypes.String} compressed onDelete={fn()} />
      <GroupBadge type={KeyTypes.Hash} compressed onDelete={fn()} />
      <GroupBadge type={KeyTypes.List} compressed onDelete={fn()} />
      <GroupBadge type={CommandGroup.Generic} compressed onDelete={fn()} />
      <GroupBadge type={CommandGroup.PubSub} compressed onDelete={fn()} />
    </div>
  ),
  decorators: [
    (Story) => (
      <div>
        <h2>Compressed with Delete</h2>
        <p>Compact badges with delete button</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: Custom Type
// Shows badge with custom/unknown type (uses default color)
// ============================================================================

export const CustomType: Story = {
  args: {
    type: 'custom-type',
  },
  decorators: [
    (Story) => (
      <div>
        <h2>Custom Type</h2>
        <p>Badge with unknown type falls back to default color</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: With Custom Name
// Shows badge with custom name parameter
// ============================================================================

export const WithCustomName: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <GroupBadge type={KeyTypes.String} name="user:*" />
      <GroupBadge type={KeyTypes.Hash} name="session:*" />
      <GroupBadge type={KeyTypes.List} name="queue:*" />
    </div>
  ),
  decorators: [
    (Story) => (
      <div>
        <h2>With Custom Name</h2>
        <p>Badges with custom name parameter (used for data-testid)</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: With Custom Class
// Shows badges with custom CSS classes applied
// ============================================================================

export const WithCustomClass: Story = {
  render: () => (
    <>
      <style>
        {`
          .custom-badge-large {
            transform: scale(1.5);
          }
          .custom-badge-bordered {
            border: 2px solid #333 !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
          .custom-badge-spaced {
            margin: 16px;
          }
        `}
      </style>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <GroupBadge type={KeyTypes.String} className="custom-badge-large" />
        <GroupBadge type={KeyTypes.Hash} className="custom-badge-bordered" />
        <GroupBadge type={KeyTypes.List} className="custom-badge-spaced" />
        <GroupBadge
          type={CommandGroup.Generic}
          className="custom-badge-large custom-badge-bordered"
        />
      </div>
    </>
  ),
  decorators: [
    (Story) => (
      <div>
        <h2>With Custom Class</h2>
        <p>Badges with custom CSS classes for styling customization</p>
        <Story />
      </div>
    ),
  ],
}
