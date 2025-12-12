import React, { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { TextInput } from 'uiSrc/components/base/inputs'
import { PrimaryButton, EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { Text } from 'uiSrc/components/base/text'
import { VectorSearchQueryType } from 'uiSrc/constants'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import {
  searchVectorSetByElement,
  searchVectorSetByVector,
  clearSearch,
  vectorsetSearchSelector,
} from 'uiSrc/slices/browser/vectorset'
import { AppDispatch } from 'uiSrc/slices/store'

import type {
  VectorSetSearchProps,
  SearchQueryType,
} from './VectorSetSearch.types'
import * as S from './VectorSetSearch.styles'
import { parseVectorInput } from '../../utils'

const SEARCH_TYPE_OPTIONS = [
  { value: VectorSearchQueryType.ELE, label: 'By Element' },
  { value: VectorSearchQueryType.VALUES, label: 'By Vector' },
]

const DEFAULT_COUNT = 10

const VectorSetSearch = ({ onSearch, onClear }: VectorSetSearchProps) => {
  const dispatch = useDispatch<AppDispatch>()

  const { name: keyName } = useSelector(selectedKeyDataSelector) ?? {}
  const { loading } = useSelector(vectorsetSearchSelector)

  const [searchType, setSearchType] = useState<SearchQueryType>(
    VectorSearchQueryType.ELE,
  )
  const [elementName, setElementName] = useState('')
  const [vectorInput, setVectorInput] = useState('')
  const [count, setCount] = useState(DEFAULT_COUNT.toString())

  const handleSearch = useCallback(() => {
    if (!keyName) return

    const countValue = parseInt(count, 10) || DEFAULT_COUNT

    if (searchType === VectorSearchQueryType.ELE) {
      if (!elementName.trim()) return
      dispatch(
        searchVectorSetByElement(keyName, elementName.trim(), countValue),
      )
    } else {
      const vector = parseVectorInput(vectorInput)
      if (!vector || vector.length === 0) return
      dispatch(searchVectorSetByVector(keyName, vector, countValue))
    }

    onSearch()
  }, [keyName, searchType, elementName, vectorInput, count, dispatch, onSearch])

  const handleClear = useCallback(() => {
    setElementName('')
    setVectorInput('')
    dispatch(clearSearch())
    onClear()
  }, [dispatch, onClear])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch],
  )

  const isSearchDisabled =
    loading ||
    (searchType === VectorSearchQueryType.ELE
      ? !elementName.trim()
      : !parseVectorInput(vectorInput))

  return (
    <S.Container
      align="center"
      gap="m"
      data-testid="vectorset-search"
      grow={false}
    >
      <RiSelect
        value={searchType}
        options={SEARCH_TYPE_OPTIONS}
        onChange={(value) => setSearchType(value as SearchQueryType)}
        data-testid="vectorset-search-type"
      />

      {searchType === VectorSearchQueryType.ELE ? (
        <S.SearchInputWrapper>
          <TextInput
            name="element-search"
            id="element-search"
            placeholder="Enter element name"
            value={elementName}
            onChange={setElementName}
            onKeyDown={handleKeyDown}
            disabled={loading}
            data-testid="vectorset-search-element-input"
          />
        </S.SearchInputWrapper>
      ) : (
        <S.VectorInput>
          <TextInput
            name="vector-search"
            id="vector-search"
            placeholder="Enter vector values: [1.0, 2.0, 3.0] or 1.0, 2.0, 3.0"
            value={vectorInput}
            onChange={setVectorInput}
            onKeyDown={handleKeyDown}
            disabled={loading}
            data-testid="vectorset-search-vector-input"
          />
        </S.VectorInput>
      )}

      <S.CountInput>
        <TextInput
          name="count"
          id="count"
          placeholder="Count"
          value={count}
          onChange={setCount}
          disabled={loading}
          data-testid="vectorset-search-count"
        />
      </S.CountInput>

      <Text size="s" color="secondary">
        results
      </Text>

      <PrimaryButton
        size="small"
        onClick={handleSearch}
        disabled={isSearchDisabled}
        data-testid="vectorset-search-btn"
      >
        Search
      </PrimaryButton>

      <EmptyButton
        size="small"
        onClick={handleClear}
        disabled={loading}
        data-testid="vectorset-clear-btn"
      >
        Clear
      </EmptyButton>
    </S.Container>
  )
}

export { VectorSetSearch }
