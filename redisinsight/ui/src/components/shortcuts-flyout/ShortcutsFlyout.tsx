import React from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
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
import { useTranslation } from 'uiSrc/i18n'

import { SHORTCUTS, Shortcut, ShortcutGroup, separator } from './schema'

const ShortcutsFlyout = () => {
  const { isShortcutsFlyoutOpen, server } = useAppSelector(appInfoSelector)
  const { t } = useTranslation()

  const dispatch = useAppDispatch()

  const tableColumns: ColumnDefinition<Shortcut>[] = [
    {
      header: t('shortcuts.column.description'),
      id: 'description',
      accessorKey: 'descriptionKey',
      enableSorting: false,
      cell: ({ row }: { row: { original: Shortcut } }) =>
        t(row.original.descriptionKey),
    },
    {
      header: t('shortcuts.column.shortcut'),
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

  const ShortcutsTable = ({ name, nameKey, items }: ShortcutGroup) => (
    <div key={name} data-testid={`shortcuts-table-${name}`}>
      <Title size="XS" data-test-subj={`shortcuts-section-${name}`}>
        {t(nameKey)}
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
      title={t('shortcuts.title')}
    >
      <DrawerHeader title={t('shortcuts.title')} />
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
