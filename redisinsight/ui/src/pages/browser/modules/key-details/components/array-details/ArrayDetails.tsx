import React from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import {
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { bufferToString } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { ArrayDetailsTable } from './array-details-table'
import { ArrayRangeForm } from './array-range-form'
import { useArrayRangeQuery } from './hooks'
import * as S from './ArrayDetails.styles'

export interface Props extends KeyDetailsHeaderProps {}

/**
 * View / Browse vertical container for the array key type. Composes the
 * standard `KeyDetailsHeader` (length + count surfaced via the array
 * key-info strategy), a range/scan query form, and the virtualized
 * result table. Editing, deleting, and the Aggregate / Search / Add
 * tabs live in their own verticals (see
 * docs/redis-array-type-initiative.md §6 Tasks 2,4-7).
 */
const ArrayDetails = (props: Props) => {
  const { loading } = useAppSelector(selectedKeySelector)
  const selectedKeyData = useAppSelector(selectedKeyDataSelector)
  const keyName = selectedKeyData?.name
    ? bufferToString(selectedKeyData.name as RedisResponseBuffer)
    : ''

  const {
    start,
    end,
    showEmpty,
    setStart,
    setEnd,
    setShowEmpty,
    runQuery,
    resetQuery,
    elements,
    loading: rangeLoading,
  } = useArrayRangeQuery()

  return (
    <S.Container data-testid="array-details">
      <KeyDetailsHeader {...props} key="key-details-header" />
      <ArrayRangeForm
        keyName={keyName}
        start={start}
        end={end}
        showEmpty={showEmpty}
        loading={rangeLoading}
        onChangeStart={setStart}
        onChangeEnd={setEnd}
        onToggleShowEmpty={setShowEmpty}
        onRun={runQuery}
        onReset={resetQuery}
      />
      <S.DetailsBody>
        {!loading && (
          <S.TableWrapper>
            <ArrayDetailsTable elements={elements} loading={rangeLoading} />
          </S.TableWrapper>
        )}
      </S.DetailsBody>
    </S.Container>
  )
}

export { ArrayDetails }
