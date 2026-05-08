import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'
import { IconButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { InfoIcon, ResetIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { TextInput, QuantityCounter } from 'uiSrc/components/base/inputs'

import {
  getVectorFieldInfo,
  validateVector,
} from '../../vector-set-element-form/utils'

import { CommandPreview } from '../command-preview'
import { FilterSyntaxHelpPopover } from '../filter-syntax-help-popover'
import {
  CountInlineLabel,
  FilterLabel,
  FormContainer,
  ModeButtonContent,
  ModeInfoIcon,
} from './SimilaritySearchForm.styles'
import {
  ELEMENT_MODE_TOOLTIP,
  ELEMENT_PLACEHOLDER,
  FILTER_PLACEHOLDER,
  SIMILARITY_SEARCH_COUNT_DEFAULT,
  SIMILARITY_SEARCH_COUNT_MAX,
  SIMILARITY_SEARCH_COUNT_MIN,
  VECTOR_MODE_TOOLTIP,
} from './constants'
import {
  SimilaritySearchFormProps,
  SimilaritySearchFormState,
  SimilaritySearchMode,
} from './SimilaritySearchForm.types'

const initialFormState = (): SimilaritySearchFormState => ({
  mode: 'vector',
  vectorInput: '',
  elementInput: '',
  count: SIMILARITY_SEARCH_COUNT_DEFAULT,
  filter: '',
})

const isQueryReady = (
  state: SimilaritySearchFormState,
  vectorDim?: number,
): boolean => {
  if (state.mode === 'element') {
    return state.elementInput.trim().length > 0
  }
  const result = validateVector(state.vectorInput, vectorDim)
  return !result.error && result.kind !== undefined
}

export const SimilaritySearchForm = ({
  keyName,
  vectorDim,
  onSubmit,
  onStateChange,
  onReset,
  preview,
  loading = false,
  previewLoading = false,
  'data-testid': dataTestId = 'similarity-search-form',
}: SimilaritySearchFormProps) => {
  const [state, setState] =
    useState<SimilaritySearchFormState>(initialFormState)

  const setMode = useCallback((mode: SimilaritySearchMode) => {
    setState((prev) => ({ ...prev, mode }))
  }, [])

  const setField = useCallback(
    <K extends keyof SimilaritySearchFormState>(
      key: K,
      value: SimilaritySearchFormState[K],
    ) => {
      setState((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  // Notify the parent on every form-state change (and on mount, to seed the
  // initial preview). The parent debounces the actual preview request so we
  // can fire freely on each render.
  useEffect(() => {
    onStateChange?.(state)
  }, [state, keyName, onStateChange])

  const vectorFieldInfo = useMemo(
    () => getVectorFieldInfo(state.vectorInput, vectorDim),
    [state.vectorInput, vectorDim],
  )

  const queryReady = isQueryReady(state, vectorDim)
  // The button mirrors *both* loading flags so the user can see we are still
  // resolving the command before letting them dispatch the search.
  const submitLoading = loading || previewLoading
  const submitDisabled = submitLoading || !queryReady

  const handleSubmit = useCallback(() => {
    if (!queryReady) return
    onSubmit?.(state)
  }, [onSubmit, queryReady, state])

  const handleReset = useCallback(() => {
    setState(initialFormState())
    onReset?.()
  }, [onReset])

  const vectorPlaceholder =
    'Enter a vector to find items with the most similar vectors.'

  return (
    <FormContainer data-testid={dataTestId} gap="m" grow={false}>
      <Row align="center" gap="m">
        <FlexItem grow={false}>
          <ButtonGroup data-testid={`${dataTestId}-mode-toggle`}>
            <ButtonGroup.Button
              isSelected={state.mode === 'vector'}
              onClick={() => setMode('vector')}
              data-testid={`${dataTestId}-mode-vector`}
            >
              <ModeButtonContent>
                Vector
                <RiTooltip content={VECTOR_MODE_TOOLTIP} position="top">
                  <ModeInfoIcon
                    aria-label={VECTOR_MODE_TOOLTIP}
                    data-testid={`${dataTestId}-mode-vector-info`}
                  >
                    <InfoIcon />
                  </ModeInfoIcon>
                </RiTooltip>
              </ModeButtonContent>
            </ButtonGroup.Button>
            <ButtonGroup.Button
              isSelected={state.mode === 'element'}
              onClick={() => setMode('element')}
              data-testid={`${dataTestId}-mode-element`}
            >
              <ModeButtonContent>
                Element
                <RiTooltip content={ELEMENT_MODE_TOOLTIP} position="top">
                  <ModeInfoIcon
                    aria-label={ELEMENT_MODE_TOOLTIP}
                    data-testid={`${dataTestId}-mode-element-info`}
                  >
                    <InfoIcon />
                  </ModeInfoIcon>
                </RiTooltip>
              </ModeButtonContent>
            </ButtonGroup.Button>
          </ButtonGroup>
        </FlexItem>
        <FlexItem grow>
          {state.mode === 'vector' ? (
            <FormField>
              <TextInput
                placeholder={vectorPlaceholder}
                value={state.vectorInput}
                onChange={(value) => setField('vectorInput', value)}
                disabled={loading}
                error={
                  vectorFieldInfo.isError ? vectorFieldInfo.text : undefined
                }
                data-testid={`${dataTestId}-vector-input`}
              />
            </FormField>
          ) : (
            <FormField>
              <TextInput
                placeholder={ELEMENT_PLACEHOLDER}
                value={state.elementInput}
                onChange={(value) => setField('elementInput', value)}
                disabled={loading}
                data-testid={`${dataTestId}-element-input`}
              />
            </FormField>
          )}
        </FlexItem>
        <FlexItem grow={false}>
          <Row align="center" gap="m">
            <CountInlineLabel data-testid={`${dataTestId}-count-label`}>
              Result count
            </CountInlineLabel>
            <QuantityCounter
              value={state.count ?? SIMILARITY_SEARCH_COUNT_DEFAULT}
              onChange={(value: number | null) =>
                setField('count', value ?? SIMILARITY_SEARCH_COUNT_DEFAULT)
              }
              min={SIMILARITY_SEARCH_COUNT_MIN}
              max={SIMILARITY_SEARCH_COUNT_MAX}
              step={1}
              data-testid={`${dataTestId}-count-input`}
            />
          </Row>
        </FlexItem>
      </Row>

      <Row align="end" gap="m">
        <FlexItem grow>
          <FormField>
            <Row align="center" gap="s">
              <FilterLabel>
                Filter expression
                <FilterSyntaxHelpPopover
                  data-testid={`${dataTestId}-filter-help`}
                />
              </FilterLabel>
              <FlexItem grow>
                <TextInput
                  placeholder={FILTER_PLACEHOLDER}
                  value={state.filter}
                  onChange={(value) => setField('filter', value)}
                  disabled={loading}
                  data-testid={`${dataTestId}-filter-input`}
                />
              </FlexItem>
            </Row>
          </FormField>
        </FlexItem>
      </Row>

      <Row align="center" gap="m">
        <FlexItem grow>
          <CommandPreview
            command={preview ?? ''}
            data-testid={`${dataTestId}-preview`}
          />
        </FlexItem>
        <FlexItem grow={false}>
          <RiTooltip content="Reset form" position="top">
            <IconButton
              size="M"
              icon={ResetIcon}
              onClick={handleReset}
              disabled={loading}
              aria-label="Reset similarity search form"
              data-testid={`${dataTestId}-reset`}
            />
          </RiTooltip>
        </FlexItem>
        <FlexItem grow={false}>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={submitDisabled}
            loading={submitLoading}
            data-testid={`${dataTestId}-submit`}
          >
            Find similar items
          </PrimaryButton>
        </FlexItem>
      </Row>
    </FormContainer>
  )
}
