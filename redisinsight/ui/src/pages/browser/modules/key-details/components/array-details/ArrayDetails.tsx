import React, { useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { bufferToString } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { Text } from 'uiSrc/components/base/text'

import { ArrayDetailsTable } from './array-details-table'
import { ArrayRangeForm } from './array-range-form'
import ArrayTabs from './array-tabs'
import {
  ARRAY_DETAILS_TAB_LABELS,
  ArrayDetailsTab,
  DEFAULT_ARRAY_DETAILS_TAB,
} from './constants'
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

  const [activeTab, setActiveTab] = useState<ArrayDetailsTab>(
    DEFAULT_ARRAY_DETAILS_TAB,
  )

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
    error: rangeError,
  } = useArrayRangeQuery(keyProp)

  const isViewTab = activeTab === ArrayDetailsTab.View

  return (
    <S.Container data-testid="array-details">
      <KeyDetailsHeader {...props} key="key-details-header" />
      <S.TabsWrapper>
        <ArrayTabs value={activeTab} onChange={setActiveTab} />
      </S.TabsWrapper>
      {isViewTab && (
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
          disabled={!isArrayKeyReady}
        />
      )}
      <S.DetailsBody>
        {isViewTab && !loading && (
          <S.TableWrapper>
            <ArrayDetailsTable
              elements={elements}
              loading={rangeLoading}
              error={rangeError}
            />
          </S.TableWrapper>
        )}
        {!isViewTab && (
          <S.PlaceholderWrapper data-testid={`array-${activeTab}-placeholder`}>
            <Text>{`This is ${ARRAY_DETAILS_TAB_LABELS[activeTab]}`}</Text>
          </S.PlaceholderWrapper>
        )}
      </S.DetailsBody>
    </S.Container>
  )
}

export { ArrayDetails }
