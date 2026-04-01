import React, { memo, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import {
  vectorSetDataSelector,
  vectorSetSelector,
} from 'uiSrc/slices/browser/vectorSet'
import { VectorSetElement } from 'uiSrc/slices/interfaces'

import { getVectorSetColumns } from './VectorSetElementList.config'
import * as S from './VectorSetElementList.styles'

const VectorSetElementList = memo(() => {
  const { loading } = useSelector(vectorSetSelector)
  const { elements: loadedElements } = useSelector(vectorSetDataSelector)
  const { compressor = null } = useSelector(connectedInstanceSelector)
  const { viewFormat } = useSelector(selectedKeySelector)

  const [elements, setElements] = useState<VectorSetElement[]>(loadedElements)

  useEffect(() => {
    setElements(loadedElements)
  }, [loadedElements])

  const columns = useMemo(
    () => getVectorSetColumns({ compressor: compressor as any, viewFormat }),
    [compressor, viewFormat],
  )

  const MIN_COLUMN_WIDTH = 100
  const tableMinWidth = useMemo(
    () => `${Math.max(columns.length * MIN_COLUMN_WIDTH, 550)}px`,
    [columns.length],
  )

  const emptyMessage = useMemo(() => {
    if (loading) {
      return 'Loading...'
    }
    return 'No results found.'
  }, [loading])

  return (
    <S.Container data-testid="vector-set-details">
      <S.StyledTable
        columns={columns}
        data={elements}
        stripedRows
        minWidth={tableMinWidth}
        emptyState={emptyMessage}
        data-testid="vector-set-details-table"
      />
    </S.Container>
  )
})

export { VectorSetElementList }
