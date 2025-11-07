import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { action } from 'storybook/actions'
import { expect, fn, screen } from 'storybook/test'

import SentinelDatabases from './SentinelDatabases'
import {
  AddRedisDatabaseStatus,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'
import { RowSelectionState } from '@redis-ui/table'
import { colFactory, getRowId } from '../../useSentinelDatabasesConfig'

const meta: Meta<typeof SentinelDatabases> = {
  component: SentinelDatabases,
  args: {
    onBack: fn(),
    onClose: fn(),
    onSubmit: fn(),
  },
}

export default meta
type Story = StoryObj<typeof SentinelDatabases>

let mastersMock: ModifiedSentinelMaster[] = [
  {
    name: 'mymaster',
    status: AddRedisDatabaseStatus.Fail,
    message: '',
    host: '192.168.0.19',
    port: '6379',
    numberOfSlaves: 0,
    // nodes: [],
    id: '1',
    alias: 'mymaster',
    username: '',
    password: '',
    db: 1,
  },
  {
    name: 'mymaster2',
    status: AddRedisDatabaseStatus.Success,
    message: '',
    host: '192.168.0.18',
    port: '6380',
    numberOfSlaves: 0,
    // nodes: [],
    id: '2',
    alias: 'mymaster2',
    username: '',
    password: '',
    db: 1,
  },
  {
    name: 'mymaster3',
    status: AddRedisDatabaseStatus.Fail,
    message: '',
    host: '192.168.0.18',
    port: '6380',
    numberOfSlaves: 0,
    alias: 'mymaster3',
    username: 'default',
    password: 'abcde',
    db: 1,
  },
]
let columnsMock = colFactory(mastersMock, () => {})

const DefaultRender = () => {
  const [rowSelection, setSelection] = useState<RowSelectionState>({})
  const selection = Object.keys(rowSelection)
    .map((key) => mastersMock.find((master) => getRowId(master) === key))
    .filter((item): item is ModifiedSentinelMaster => Boolean(item))
  return (
    <SentinelDatabases
      selection={selection || []}
      columns={columnsMock}
      masters={mastersMock}
      onClose={meta.args?.onClose!}
      onBack={meta.args?.onBack!}
      onSubmit={meta.args?.onSubmit!}
      onSelectionChange={(sel) => {
        setSelection(sel)
      }}
    />
  )
}

export const Default: Story = {
  render: () => <DefaultRender />,
  play: async ({ canvas, userEvent, args, step }) => {
    await step('Ensure render', async () => {
      await expect(canvas.getByTestId('row-selection')).toBeInTheDocument()
      await expect(canvas.getByText('mymaster')).toBeInTheDocument()
      await expect(canvas.getByText('mymaster2')).toBeInTheDocument()
      await expect(
        canvas.getByText('Auto-Discover Redis Sentinel Primary Groups'),
      ).toBeInTheDocument()
      await expect(canvas.getByText('Add databases')).toBeInTheDocument()
    })
    // you can group interactions with `step`
    await step('Ensure cancel is called', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }))
      await userEvent.click(screen.getByRole('button', { name: 'Proceed' }))
      await expect(args.onClose).toHaveBeenCalled()
    })
    // or you can just call actions sequentially
    // await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }))
    // await userEvent.click(screen.getByRole('button', { name: 'Proceed' }))
    // await expect(args.onClose).toHaveBeenCalled()
    await step('Back to add databases screen is called', async () => {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Add databases' }),
      )
      await expect(args.onBack).toHaveBeenCalled()
    })
    await step('Primary group selection', async () => {
      await userEvent.click(canvas.getByTestId('row-selection-1'))
      await userEvent.click(
        // name can be exact matching string or regex
        canvas.getByRole('button', { name: /add primary group/i }),
      )
      await expect(args.onSubmit).toHaveBeenCalled()
    })
  },
}
const emptyColumnsMock = colFactory([], () => {})
export const Empty: Story = {
  args: {
    selection: [],
    columns: emptyColumnsMock,
    masters: [],
    onClose: action('onClose'),
    onBack: action('onBack'),
    onSubmit: action('onSubmit'),
    onSelectionChange: action('on selection change'),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText('Your Redis Sentinel has no primary groups available'),
    ).toBeInTheDocument()
  },
}
