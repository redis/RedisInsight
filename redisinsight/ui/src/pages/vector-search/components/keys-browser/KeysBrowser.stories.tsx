import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Route } from 'react-router-dom'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Card, Spacer } from 'uiSrc/components/base/layout'
import { bufferToString } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import KeysBrowser from './KeysBrowser'
import { StorePopulator } from './__stories__/StorePopulator'

const KeysBrowserContent = () => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const handleSelectKey = (key: RedisResponseBuffer) => {
    setSelectedKey(bufferToString(key))
  }

  return (
    <Col>
      <div style={{ width: 300, height: 500, border: '1px solid #ccc' }}>
        <KeysBrowser onSelectKey={handleSelectKey} />
      </div>

      <Spacer size="l" />
      <Card style={{ padding: '10px' }}>
        <Text size="s" color="secondary">
          Selected key: {selectedKey ?? '(none)'}
        </Text>
      </Card>
    </Col>
  )
}

const meta: Meta<typeof KeysBrowser> = {
  component: KeysBrowser,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    () => (
      <StorePopulator>
        <Route path="/:instanceId/vector-search">
          <KeysBrowserContent />
        </Route>
      </StorePopulator>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
