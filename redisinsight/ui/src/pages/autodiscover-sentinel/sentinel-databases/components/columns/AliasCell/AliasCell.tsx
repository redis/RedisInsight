import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'

import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { getMetaAction } from '../../utils'

import type { AliasCellRendererProps } from './AliasCell.types'

export const AliasCellRenderer = ({
  id,
  alias,
  name,
  handleChangedInput,
}: AliasCellRendererProps) => (
  <div role="presentation">
    <InputFieldSentinel
      name={`alias-${id}`}
      value={alias || name}
      placeholder="Enter Database Alias"
      inputType={SentinelInputFieldType.Text}
      onChangedInput={handleChangedInput}
      maxLength={500}
    />
  </div>
)

export const AliasCell = ({
  row,
  column,
}: CellContext<ModifiedSentinelMaster, unknown>) => {
  const { id, alias, name } = row.original
  const handleChangedInput = getMetaAction(column) as (
    name: string,
    value: string,
  ) => void
  return (
    <AliasCellRenderer
      id={id}
      alias={alias}
      name={name}
      handleChangedInput={handleChangedInput}
    />
  )
}
