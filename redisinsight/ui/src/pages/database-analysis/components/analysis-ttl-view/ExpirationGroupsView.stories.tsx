import React, { useEffect, useMemo } from 'react'
import { faker } from '@faker-js/faker'
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

// ============================================================================
// Helper: Generate Expiration Groups Data
// ============================================================================

const generateExpirationData = () => {
  const totalMemoryBytes = faker.number.int({ min: 10000, max: 100000 })
  const totalKeysCount = faker.number.int({ min: 1000, max: 10000 })

  return {
    totalMemory: {
      total: totalMemoryBytes,
    },
    totalKeys: {
      total: totalKeysCount,
    },
    expirationGroups: [
      {
        label: 'No Expiry',
        total: faker.number.int({ min: 100, max: totalMemoryBytes * 0.3 }),
        threshold: 0,
      },
      {
        label: '<1 hr',
        total: faker.number.int({ min: 100, max: 5000 }),
        threshold: 3600,
      },
      {
        label: '1-4 Hrs',
        total: faker.number.int({ min: 100, max: 4000 }),
        threshold: 14400,
      },
      {
        label: '4-12 Hrs',
        total: faker.number.int({ min: 100, max: 3000 }),
        threshold: 43200,
      },
      {
        label: '12-24 Hrs',
        total: faker.number.int({ min: 100, max: 2500 }),
        threshold: 86400,
      },
      {
        label: '1-7 Days',
        total: faker.number.int({ min: 50, max: 2000 }),
        threshold: 604800,
      },
      {
        label: '>7 Days',
        total: faker.number.int({ min: 50, max: 1500 }),
        threshold: 2592000,
      },
      {
        label: '>1 Month',
        total: faker.number.int({ min: 50, max: 1000 }),
        threshold: 9007199254740991,
      },
    ],
  }
}

// ============================================================================
// Story: Default - Shows expiration groups chart with data
// ============================================================================

const DefaultRender = () => {
  const dispatch = useDispatch()

  const data = useMemo(() => generateExpirationData(), [])

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

// ============================================================================
// Story: WithExtrapolation - Shows chart with extrapolation enabled
// ============================================================================

const WithExtrapolationRender = () => {
  const dispatch = useDispatch()

  const data = useMemo(() => generateExpirationData(), [])

  useEffect(() => {
    dispatch(setShowNoExpiryGroup(true))
  }, [dispatch])

  return (
    <ExpirationGroupsView
      data={data as any}
      loading={false}
      extrapolation={2.5}
      onSwitchExtrapolation={fn()}
    />
  )
}

export const WithExtrapolation: Story = {
  render: () => <WithExtrapolationRender />,
}

// ============================================================================
// Story: HideNoExpiry - Shows chart without "No Expiry" group
// ============================================================================

const HideNoExpiryRender = () => {
  const dispatch = useDispatch()

  const data = useMemo(() => generateExpirationData(), [])

  useEffect(() => {
    dispatch(setShowNoExpiryGroup(false))
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

export const HideNoExpiry: Story = {
  render: () => <HideNoExpiryRender />,
}

// ============================================================================
// Story: Loading - Shows loading state
// ============================================================================

export const Loading: Story = {
  args: {
    data: null,
    loading: true,
    extrapolation: 1,
    onSwitchExtrapolation: fn(),
  },
}

// ============================================================================
// Story: Empty - No data (component returns null)
// ============================================================================

export const Empty: Story = {
  args: {
    data: {
      totalMemory: { total: 0 },
      totalKeys: { total: 0 },
      expirationGroups: [],
    } as any,
    loading: false,
    extrapolation: 1,
    onSwitchExtrapolation: fn(),
  },
}