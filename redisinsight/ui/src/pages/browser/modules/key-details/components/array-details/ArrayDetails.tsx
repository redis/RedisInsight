import React from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
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

export interface Props extends KeyDetailsHeaderProps {
  keyProp: RedisResponseBuffer | null
}

/**
 * View / Browse vertical container for the array key type. Composes the
 * standard `KeyDetailsHeader` (length + count surfaced via the array
 * key-info strategy), a range/scan query form, and the virtualized
 * result table. Editing, deleting, and the Aggregate / Search / Add
 * tabs live in their own verticals (see
 * docs/redis-array-type-initiative.md §6 Tasks 2,4-7).
 */
const ArrayDetails = (props: Props) => {
  const { keyProp } = props
  const { loading } = useAppSelector(selectedKeySelector)
  // Render the form's CLI preview off `keyProp` rather than the cached
  // `selectedKeyData?.name` so the displayed key matches the one the
  // form will actually query — avoids a one-fetch lag while
  // `fetchKeyInfo` populates the selected-key slice.
  const keyName = keyProp ? bufferToString(keyProp) : ''

  const {
    start,
    end,
    showEmpty,
    setStart,
    setEnd,
    setShowEmpty,
    runQuery,
    resetQuery,
    isArrayKeyReady,
    elements,
    loading: rangeLoading,
  } = useArrayRangeQuery(keyProp)

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
        // While the selected-key slice hasn't caught up with `keyProp`
        // (or the resolved type isn't Array), disable manual actions —
        // the hook also guards internally but this gives the user
        // immediate feedback rather than a no-op click.
        disabled={!isArrayKeyReady}
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
