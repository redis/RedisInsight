import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { type ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import {
  SentinelDatabaseIds,
  SentinelDatabaseTitles,
} from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

import {
  AddressCell,
  AliasCell,
  DbIndexCell,
  PasswordCell,
  PrimaryGroupCell,
  SentinelMasterSelectionHeader,
  SentinelMasterSelectionRow,
  UsernameCell,
} from '../columns'

export const getColumns = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster>[] => {
  return [
    {
      id: 'row-selection',
      maxSize: 50,
      size: 50,
      isHeaderCustom: true,
      header: SentinelMasterSelectionHeader,
      cell: SentinelMasterSelectionRow,
    },
    {
      header: SentinelDatabaseTitles.PrimaryGroup,
      id: SentinelDatabaseIds.PrimaryGroup,
      accessorKey: SentinelDatabaseIds.PrimaryGroup,
      enableSorting: true,
      size: 200,
      cell: PrimaryGroupCell,
    },
    {
      header: SentinelDatabaseTitles.Alias,
      id: SentinelDatabaseIds.Alias,
      accessorKey: SentinelDatabaseIds.Alias,
      enableSorting: true,
      size: 200,
      cell: AliasCell,
      meta: { props: { handleChangedInput } },
    },
    {
      header: SentinelDatabaseTitles.Address,
      id: SentinelDatabaseIds.Address,
      accessorKey: SentinelDatabaseIds.Address,
      enableSorting: true,
      cell: AddressCell,
    },
    {
      header: SentinelDatabaseTitles.NumberOfReplicas,
      id: SentinelDatabaseIds.NumberOfReplicas,
      accessorKey: SentinelDatabaseIds.NumberOfReplicas,
      enableSorting: true,
      size: 120,
    },
    {
      header: SentinelDatabaseTitles.Username,
      id: SentinelDatabaseIds.Username,
      accessorKey: SentinelDatabaseIds.Username,
      cell: UsernameCell,
      meta: { props: { handleChangedInput } },
    },
    {
      header: SentinelDatabaseTitles.Password,
      id: SentinelDatabaseIds.Password,
      accessorKey: SentinelDatabaseIds.Password,
      cell: PasswordCell,
      meta: { props: { handleChangedInput } },
    },
    {
      header: SentinelDatabaseTitles.DatabaseIndex,
      id: SentinelDatabaseIds.DatabaseIndex,
      accessorKey: SentinelDatabaseIds.DatabaseIndex,
      size: 140,
      cell: DbIndexCell,
      meta: { props: { handleChangedInput } },
    },
  ]
}
