import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { fetchArrayNeighbours } from 'uiSrc/slices/browser/array'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'
import { getNeighbourRange } from 'uiSrc/utils/arrayIndex'
import { DEFAULT_ERROR_MESSAGE, Nullable } from 'uiSrc/utils'
import { KeyValueCompressor } from 'uiSrc/constants'

import { ARRAY_TABLE_LOADING_MESSAGE } from '../../array-details-table/constants'
import {
  ArrayIndexCell,
  ArrayValueCell,
} from '../../array-details-table/components'
import { NeighbourBandProps } from './NeighbourBand.types'
import * as S from './NeighbourBand.styles'

const TEST_ID_PREFIX = 'array-context-band'

/**
 * Expanded panel rendered under a search match. Fetches the ±count index
 * window around `matchIndex`, holds the result in local state (writes
 * nothing to the shared array slice), and highlights the matched row.
 * Refetches when `count` changes and aborts the in-flight request on
 * unmount / dependency change via a per-instance `AbortController`.
 */
export const NeighbourBand = ({
  keyProp,
  matchIndex,
  count,
}: NeighbourBandProps) => {
  const dispatch = useAppDispatch()
  const { compressor = null } = useAppSelector(
    connectedInstanceSelector,
  ) as unknown as { compressor: Nullable<KeyValueCompressor> }
  const { viewFormat } = useAppSelector(selectedKeySelector)

  const [elements, setElements] = useState<ArrayDataElement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const { start, end } = getNeighbourRange(matchIndex, count)
    setLoading(true)
    setError('')

    dispatch(
      fetchArrayNeighbours({ key: keyProp, start, end }, controller.signal),
    )
      .then((result) => {
        if (controller.signal.aborted) return
        setElements(result)
        setLoading(false)
      })
      .catch((e) => {
        if (axios.isCancel(e) || controller.signal.aborted) return
        setError(e?.message || DEFAULT_ERROR_MESSAGE)
        setLoading(false)
      })

    return () => controller.abort()
  }, [dispatch, keyProp, matchIndex, count])

  if (loading) {
    return (
      <S.Message data-testid={`${TEST_ID_PREFIX}-loading-${matchIndex}`}>
        {ARRAY_TABLE_LOADING_MESSAGE}
      </S.Message>
    )
  }

  if (error) {
    return (
      <S.Message data-testid={`${TEST_ID_PREFIX}-error-${matchIndex}`}>
        {error}
      </S.Message>
    )
  }

  return (
    <S.Band data-testid={`${TEST_ID_PREFIX}-${matchIndex}`}>
      {elements.map((el) => {
        const isMatch = el.index === matchIndex
        return (
          <S.BandRow
            key={el.index}
            $match={isMatch}
            data-testid={
              isMatch
                ? `${TEST_ID_PREFIX}-match-${matchIndex}`
                : `${TEST_ID_PREFIX}-row-${el.index}`
            }
          >
            <ArrayIndexCell index={el.index} />
            <ArrayValueCell
              index={el.index}
              value={el.value}
              compressor={compressor}
              viewFormat={viewFormat}
            />
          </S.BandRow>
        )
      })}
    </S.Band>
  )
}
