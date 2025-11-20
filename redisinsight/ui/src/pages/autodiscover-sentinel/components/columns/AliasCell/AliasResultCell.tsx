import React from 'react'
import { CellText } from 'uiSrc/components/auto-discover'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { errorNotAuth, getMetaProps } from 'uiSrc/utils/column'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { HandleChangedInputProps } from '../types'
import { AliasResultCellRendererProps } from './AliasCell.types'

export const AliasResultCellRenderer = ({
  id = '',
  alias,
  error,
  loading = false,
  status,
  handleChangedInput,
}: AliasResultCellRendererProps) => {
  if (errorNotAuth(error, status)) {
    return <CellText>{alias}</CellText>
  }
  return (
    <InputFieldSentinel
      name={`alias-${id}`}
      value={alias}
      placeholder="Database"
      disabled={loading}
      inputType={SentinelInputFieldType.Text}
      onChangedInput={handleChangedInput}
      maxLength={500}
    />
  )
}

export const AliasResultCell = ({
  row,
  column,
}: CellContext<ModifiedSentinelMaster, unknown>) => {
  const { id, alias, error, loading = false, status } = row.original
  const { handleChangedInput } = getMetaProps<HandleChangedInputProps>(column)
  return (
    <AliasResultCellRenderer
      id={id}
      alias={alias}
      error={error}
      loading={loading}
      status={status}
      handleChangedInput={handleChangedInput}
    />
  )
}
