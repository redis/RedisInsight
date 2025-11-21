import React, { useEffect, useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { useDispatch } from 'react-redux'

import ExpirationGroupsView from './ExpirationGroupsView'
import { setShowNoExpiryGroup } from 'uiSrc/slices/analytics/dbAnalysis'

const meta: Meta<typeof ExpirationGroupsView> = {
  component: ExpirationGroupsView,
  decorators: [
    (Story) => (
      <div style={{ height: '600px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

const sampleData = {
  totalMemory: { total: 50000 },
  totalKeys: { total: 5000 },
  expirationGroups: [
    { label: 'No Expiry', total: 15000, threshold: 0 },
    { label: '<1 hr', total: 2000, threshold: 3600 },
    { label: '1-4 Hrs', total: 3000, threshold: 14400 },
    { label: '4-12 Hrs', total: 2500, threshold: 43200 },
    { label: '12-24 Hrs', total: 2000, threshold: 86400 },
    { label: '1-7 Days', total: 1500, threshold: 604800 },
    { label: '>7 Days', total: 1000, threshold: 2592000 },
    { label: '>1 Month', total: 500, threshold: 9007199254740991 },
  ],
}

const DefaultRender = () => {
  const dispatch = useDispatch()

  const data = useMemo(() => sampleData, [])

  useEffect(() => {
    dispatch(setShowNoExpiryGroup(true))
  }, [dispatch])

  return (
    <ExpirationGroupsView
      data={data as any}
      loading={false}
      extrapolation={1}
      onSwitchExtrapolation={fn()}
    />
  )
}

export const Default: Story = {
  render: () => <DefaultRender />,
}

export const Loading: Story = {
  args: {
    data: null,
    loading: true,
    extrapolation: 1,
    onSwitchExtrapolation: fn(),
  },
}
