import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, screen } from 'storybook/test'

import { SentinelMasterFactory } from 'uiSrc/mocks/factories/sentinel/SentinelMaster.factory'
import SentinelDatabases from './SentinelDatabases'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { RowSelectionState } from '@redis-ui/table'
import { getColumns } from 'uiSrc/pages/autodiscover-sentinel/sentinel-databases/components/utils/getColumns'
import { getRowId } from '../../useSentinelDatabasesConfig'

const emptyColumnsMock = getColumns(fn())

const meta: Meta<typeof SentinelDatabases> = {
  component: SentinelDatabases,
  args: {
    selection: [],
    columns: emptyColumnsMock,
    masters: [],
    onBack: fn(),
    onClose: fn(),
    onSubmit: fn(),
    onSelectionChange: fn(),
  },
}

export default meta
type Story = StoryObj<typeof SentinelDatabases>

const DefaultRender = () => {
  const mastersMock: ModifiedSentinelMaster[] = [
    SentinelMasterFactory.build({
      id: '1',
      name: 'mymaster',
      alias: 'mymaster',
    }),
    SentinelMasterFactory.build({
      name: 'mymaster2',
      alias: 'mymaster2',
    }),
    SentinelMasterFactory.build({
      name: 'mymaster3',
      alias: 'mymaster3',
    }),
  ]
  let columnsMock = getColumns(mastersMock, () => {})
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

const With1000ItemsRender = () => {
  const mastersMock: ModifiedSentinelMaster[] = Array.from(
    { length: 1000 },
    (_, index) =>
      SentinelMasterFactory.build({
        id: String(index + 1),
        name: `mymaster${index + 1}`,
        alias: `mymaster${index + 1}`,
      }),
  )
  let columnsMock = getColumns(fn())
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

export const With1000Items: Story = {
  render: () => <With1000ItemsRender />,
}

export const Empty: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText('Your Redis Sentinel has no primary groups available'),
    ).toBeInTheDocument()
  },
}
