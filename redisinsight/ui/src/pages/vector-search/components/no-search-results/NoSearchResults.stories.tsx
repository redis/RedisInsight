import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Row } from 'uiSrc/components/base/layout/flex'
import { NoSearchResults } from './NoSearchResults'

const meta: Meta<typeof NoSearchResults> = {
  component: NoSearchResults,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Row>
        <Story />
      </Row>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
