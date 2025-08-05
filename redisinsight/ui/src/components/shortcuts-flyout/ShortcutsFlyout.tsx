import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { appInfoSelector, setShortcutsFlyoutState } from 'uiSrc/slices/app/info'
import { KeyboardShortcut } from 'uiSrc/components'
import { BuildType } from 'uiSrc/constants/env'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import {
  RiDrawer,
  RiDrawerBody,
  RiDrawerHeader,
  RiTable,
  ColumnDefinition,
} from 'uiSrc/components/base/layout'
import { RiTitle } from 'uiSrc/components/base/text/RiTitle'

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
      <RiTitle size="XS" data-test-subj={`shortcuts-section-${name}`}>
        {name}
      </RiTitle>
      <RiSpacer size="m" />
      <RiTable columns={tableColumns} data={items} defaultSorting={[]} />
      <RiSpacer size="xl" />
    </div>
  )

  return (
    <RiDrawer
      open={isShortcutsFlyoutOpen}
      onOpenChange={(isOpen) => dispatch(setShortcutsFlyoutState(isOpen))}
      data-test-subj="shortcuts-flyout"
      title="Shortcuts"
    >
      <RiDrawerHeader title="Shortcuts" />
      <RiDrawerBody>
        {SHORTCUTS.filter(
          ({ excludeFor }) =>
            !excludeFor || !excludeFor.includes(server?.buildType as BuildType),
        ).map(ShortcutsTable)}
      </RiDrawerBody>
    </RiDrawer>
  )
}

export default ShortcutsFlyout
