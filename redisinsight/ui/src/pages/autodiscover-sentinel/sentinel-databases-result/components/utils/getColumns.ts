import {
  aliasColumn,
  dbColumn,
  addressColumn,
  numberOfReplicasColumn,
  passwordColumn,
  primaryGroupColumn,
  resultColumn,
  usernameColumn,
} from '../column-definitions'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { errorNotAuth } from './index'

export const getColumns = (
  handleChangedInput: (name: string, value: string) => void,
  handleAddInstance: (masterName: string) => void,
  isInvalid: boolean,
  countSuccessAdded: number,
  itemsLength: number,
) => {
  const cols: ColumnDef<ModifiedSentinelMaster>[] = [
    resultColumn(countSuccessAdded !== itemsLength, handleAddInstance),
    primaryGroupColumn(),
    aliasColumn(handleChangedInput, errorNotAuth),
    addressColumn(),
    numberOfReplicasColumn(),
    usernameColumn(handleChangedInput, isInvalid, errorNotAuth),
    passwordColumn(handleChangedInput, isInvalid, errorNotAuth),
    dbColumn(handleChangedInput),
  ]

  return cols
}
