import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { appInfoSelector, setShortcutsFlyoutState } from 'uiSrc/slices/app/info'
import { KeyboardShortcut } from 'uiSrc/components'
import { BuildType } from 'uiSrc/constants/env'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
} from 'uiSrc/components/base/layout/drawer'
import { Title } from 'uiSrc/components/base/text/Title'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'

import { SHORTCUTS, ShortcutGroup, separator } from './schema'

const ShortcutsFlyout = () => {
  const { isShortcutsFlyoutOpen, server } = useSelector(appInfoSelector)

  const dispatch = useDispatch()

  const tableColumns: ColumnDefinition<any>[] = [
    {
      header: 'Description',
      id: 'description',
      accessorKey: 'description',
      enableSorting: false,
    },
    {
      header: 'Shortcut',
      id: 'keys',
      accessorKey: 'keys',
      enableSorting: false,
      cell: ({
        row: {
          original: { keys },
        },
      }) => <KeyboardShortcut items={keys} separator={separator} transparent />,
    },
  ]

  const ShortcutsTable = ({ name, items }: ShortcutGroup) => (
    <div key={name} data-testid={`shortcuts-table-${name}`}>
      <Title size="XS" data-test-subj={`shortcuts-section-${name}`}>
        {name}
      </Title>
      <Spacer size="m" />
      <Table columns={tableColumns} data={items} defaultSorting={[]} />
      <Spacer size="xl" />
    </div>
  )

  return (
    <Drawer
      open={isShortcutsFlyoutOpen}
      onOpenChange={(isOpen) => dispatch(setShortcutsFlyoutState(isOpen))}
      data-test-subj="shortcuts-flyout"
      title="Shortcuts"
    >
      <DrawerHeader title="Shortcuts" />
      <DrawerBody>
        {SHORTCUTS.filter(
          ({ excludeFor }) =>
            !excludeFor || !excludeFor.includes(server?.buildType as BuildType),
        ).map(ShortcutsTable)}
      </DrawerBody>
    </Drawer>
  )
}

export default ShortcutsFlyout
