import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { DatabaseListModules } from './DatabaseListModules'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import type { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

const meta: Meta<typeof DatabaseListModules> = {
  component: DatabaseListModules,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof meta>

const commonModules: AdditionalRedisModule[] = [
  { name: RedisDefaultModules.Search },
  { name: RedisDefaultModules.ReJSON },
  { name: RedisDefaultModules.TimeSeries },
]

const allModules: AdditionalRedisModule[] = [
  { name: RedisDefaultModules.AI },
  { name: RedisDefaultModules.Bloom },
  { name: RedisDefaultModules.Gears },
  { name: RedisDefaultModules.RedisGears },
  { name: RedisDefaultModules.RedisGears2 },
  { name: RedisDefaultModules.Graph },
  { name: RedisDefaultModules.ReJSON },
  { name: RedisDefaultModules.Search },
  { name: RedisDefaultModules.SearchLight },
  { name: RedisDefaultModules.TimeSeries },
  { name: RedisDefaultModules.FT },
  { name: RedisDefaultModules.FTL },
  { name: RedisDefaultModules.VectorSet },
]
const withVectorSet: AdditionalRedisModule[] = [
  {
    name: RedisDefaultModules.Bloom,
    version: 80200,
    semanticVersion: '8.2.0',
  },
  {
    name: RedisDefaultModules.VectorSet,
    version: 1,
    semanticVersion: '0.0.1',
  },
  {
    name: RedisDefaultModules.Search,
    version: 80201,
    semanticVersion: '8.2.1',
  },
  {
    name: RedisDefaultModules.TimeSeries,
    version: 80200,
    semanticVersion: '8.2.0',
  },
  {
    name: RedisDefaultModules.ReJSON,
    version: 80200,
    semanticVersion: '8.2.0',
  },
]

const customModules: AdditionalRedisModule[] = [
  { name: 'CustomModule1' },
  { name: 'AnotherCustomModule', semanticVersion: '1.0.0' },
  { name: RedisDefaultModules.Search },
]

export const AllModules: Story = {
  args: {
    modules: allModules,
  },
}

export const WithVectorSet: Story = {
  args: {
    modules: withVectorSet,
  },
}

export const SingleModule: Story = {
  args: {
    modules: [{ name: RedisDefaultModules.Search }],
  },
}

export const CommonModules: Story = {
  args: {
    modules: commonModules,
  },
}

export const WithCustomModules: Story = {
  args: {
    modules: customModules,
  },
}

export const InCircle: Story = {
  args: {
    modules: commonModules,
    inCircle: true,
  },
}

export const Highlighted: Story = {
  args: {
    modules: commonModules,
    highlight: true,
  },
}

export const InCircleAndHighlighted: Story = {
  args: {
    modules: commonModules,
    inCircle: true,
    highlight: true,
  },
}

export const WithCustomContent: Story = {
  args: {
    modules: commonModules,
    content: <span>Custom Content</span>,
  },
}

export const WithTooltipTitle: Story = {
  args: {
    modules: commonModules,
    tooltipTitle: 'Database Capabilities',
  },
}

export const WithoutStyles: Story = {
  args: {
    modules: commonModules,
    withoutStyles: true,
  },
}
