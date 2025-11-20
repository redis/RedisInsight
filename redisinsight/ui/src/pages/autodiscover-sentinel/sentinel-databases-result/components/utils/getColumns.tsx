import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import {
  SentinelDatabaseIds,
  SentinelDatabaseTitles,
} from 'uiSrc/pages/autodiscover-sentinel/constants/constants'
import { PrimaryGroupCell } from 'uiSrc/pages/autodiscover-sentinel/sentinel-databases/components/columns'
import {
  AddressCell,
  AliasCell,
  DbCell,
  PasswordCell,
  ResultCell,
  UsernameCell,
} from '../columns'

export const getColumns = (
  handleChangedInput: (name: string, value: string) => void,
  handleAddInstance: (masterName: string) => void,
  isInvalid: boolean,
  countSuccessAdded: number,
  itemsLength: number,
) => {
  const cols: ColumnDef<ModifiedSentinelMaster>[] = [
    {
      header: SentinelDatabaseTitles.Result,
      id: SentinelDatabaseIds.Message,
      accessorKey: SentinelDatabaseIds.Message,
      enableSorting: true,
      minSize: countSuccessAdded !== itemsLength ? 250 : 110,
      cell: ResultCell,
      meta: {
        props: {
          onAddInstance: handleAddInstance,
          addActions: countSuccessAdded !== itemsLength,
        },
      },
    },
    {
      header: SentinelDatabaseTitles.PrimaryGroup,
      id: SentinelDatabaseIds.PrimaryGroup,
      accessorKey: SentinelDatabaseIds.PrimaryGroup,
      enableSorting: true,
      maxSize: 200,
      cell: PrimaryGroupCell,
    },
    {
      header: SentinelDatabaseTitles.Alias,
      id: SentinelDatabaseIds.Alias,
      accessorKey: SentinelDatabaseIds.Alias,
      enableSorting: true,
      cell: AliasCell,
      meta: {
        props: { handleChangedInput },
      },
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
      maxSize: 120,
    },
    {
      header: SentinelDatabaseTitles.Username,
      id: SentinelDatabaseIds.Username,
      accessorKey: SentinelDatabaseIds.Username,
      cell: UsernameCell,
      meta: {
        props: { handleChangedInput, isInvalid },
      },
    },
    {
      header: SentinelDatabaseTitles.Password,
      id: SentinelDatabaseIds.Password,
      accessorKey: SentinelDatabaseIds.Password,
      cell: PasswordCell,
      meta: {
        props: { handleChangedInput, isInvalid },
      },
    },
    {
      header: SentinelDatabaseTitles.DatabaseIndex,
      id: SentinelDatabaseIds.DatabaseIndex,
      accessorKey: SentinelDatabaseIds.DatabaseIndex,
      size: 140,
      cell: DbCell,
      meta: {
        props: { handleChangedInput },
      },
    },
  ]

  return cols
}
