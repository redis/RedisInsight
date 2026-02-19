import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Route } from 'react-router-dom'
import { Col } from 'uiSrc/components/base/layout/flex'
import Footer from './Footer'
import { StorePopulator } from '../KeysBrowser.stories'
import { Provider } from '../contexts/Context'
const FooterContent = () => {
  return (
    <Col style={{ width: 300, height: 500, border: '1px solid transparent' }}>
      <Footer />
    </Col>
  )
}
const meta = {
  component: Footer,
  decorators: [
    () => (
      <Provider onSelectKey={() => {}}>
        <StorePopulator>
          <Route path="/:instanceId/vector-search">
            <FooterContent />
          </Route>
        </StorePopulator>
      </Provider>
    ),
  ],
} satisfies Meta<typeof Footer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
