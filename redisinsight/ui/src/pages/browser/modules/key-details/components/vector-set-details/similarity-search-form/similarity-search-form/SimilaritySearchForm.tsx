import React, { useEffect, useMemo, useState } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'
import { IconButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { InfoIcon, ResetIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { TextInput, QuantityCounter } from 'uiSrc/components/base/inputs'

import { getVectorFieldInfo } from '../../vector-set-element-form/utils'
import { useSimilaritySearch } from '../../hooks/useSimilaritySearch'

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
  SIMILARITY_SEARCH_FORM_TEST_ID as TEST_ID,
  VECTOR_MODE_TOOLTIP,
  VECTOR_PLACEHOLDER,
} from './constants'
import { initialFormState, isQueryReady } from './SimilaritySearchForm.utils'
import {
  SimilaritySearchFormProps,
  SimilaritySearchFormState,
  SimilaritySearchMode,
} from './SimilaritySearchForm.types'

export const SimilaritySearchForm = ({
  prefillElement,
}: SimilaritySearchFormProps = {}) => {
  const {
    loading,
    previewLoading,
    vectorDim,
    preview,
    runSimilaritySearch,
    runSimilaritySearchPreview,
    resetSimilaritySearch,
  } = useSimilaritySearch()

  const [state, setState] =
    useState<SimilaritySearchFormState>(initialFormState)

  // React to external prefill requests: switch to Element mode and seed the
  // element input. Keyed on `nonce` so re-requesting the same value still
  // re-applies the prefill (e.g. clicking the same row's search icon twice).
  useEffect(() => {
    if (!prefillElement) return
    setState((prev) => ({
      ...prev,
      mode: 'element',
      elementInput: prefillElement.value,
    }))
  }, [prefillElement?.nonce, prefillElement?.value])

  const setMode = (mode: SimilaritySearchMode) => {
    setState((prev) => ({ ...prev, mode }))
  }

  const setField = <K extends keyof SimilaritySearchFormState>(
    key: K,
    value: SimilaritySearchFormState[K],
  ) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  // Refresh the BE-built preview on every form-state change (and on mount, to
  // seed the initial preview). The hook debounces the actual request so we
  // can fire freely on each render.
  useEffect(() => {
    runSimilaritySearchPreview(state)
  }, [state, runSimilaritySearchPreview])

  const vectorFieldInfo = useMemo(
    () => getVectorFieldInfo(state.vectorInput, vectorDim),
    [state.vectorInput, vectorDim],
  )

  const queryReady = isQueryReady(state, vectorDim)
  // The button mirrors *both* loading flags so the user can see we are still
  // resolving the command before letting them dispatch the search.
  const submitLoading = loading || previewLoading
  const submitDisabled = submitLoading || !queryReady

  const handleSubmit = () => {
    if (!queryReady) return
    runSimilaritySearch(state)
  }

  const handleReset = () => {
    setState(initialFormState())
    resetSimilaritySearch()
  }

  return (
    <FormContainer data-testid={TEST_ID} gap="m" grow={false}>
      <Row align="center" gap="m">
        <FlexItem grow={false}>
          <ButtonGroup data-testid={`${TEST_ID}-mode-toggle`}>
            <ButtonGroup.Button
              isSelected={state.mode === 'vector'}
              onClick={() => setMode('vector')}
              data-testid={`${TEST_ID}-mode-vector`}
            >
              <ModeButtonContent>
                Vector
                <RiTooltip content={VECTOR_MODE_TOOLTIP} position="top">
                  <ModeInfoIcon
                    aria-label={VECTOR_MODE_TOOLTIP}
                    data-testid={`${TEST_ID}-mode-vector-info`}
                  >
                    <InfoIcon />
                  </ModeInfoIcon>
                </RiTooltip>
              </ModeButtonContent>
            </ButtonGroup.Button>
            <ButtonGroup.Button
              isSelected={state.mode === 'element'}
              onClick={() => setMode('element')}
              data-testid={`${TEST_ID}-mode-element`}
            >
              <ModeButtonContent>
                Element
                <RiTooltip content={ELEMENT_MODE_TOOLTIP} position="top">
                  <ModeInfoIcon
                    aria-label={ELEMENT_MODE_TOOLTIP}
                    data-testid={`${TEST_ID}-mode-element-info`}
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
                placeholder={VECTOR_PLACEHOLDER}
                value={state.vectorInput}
                onChange={(value) => setField('vectorInput', value)}
                disabled={loading}
                error={
                  vectorFieldInfo.isError ? vectorFieldInfo.text : undefined
                }
                data-testid={`${TEST_ID}-vector-input`}
              />
            </FormField>
          ) : (
            <FormField>
              <TextInput
                placeholder={ELEMENT_PLACEHOLDER}
                value={state.elementInput}
                onChange={(value) => setField('elementInput', value)}
                disabled={loading}
                data-testid={`${TEST_ID}-element-input`}
              />
            </FormField>
          )}
        </FlexItem>
        <FlexItem grow={false}>
          <Row align="center" gap="m">
            <CountInlineLabel data-testid={`${TEST_ID}-count-label`}>
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
              data-testid={`${TEST_ID}-count-input`}
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
                <FilterSyntaxHelpPopover />
              </FilterLabel>
              <FlexItem grow>
                <TextInput
                  placeholder={FILTER_PLACEHOLDER}
                  value={state.filter}
                  onChange={(value) => setField('filter', value)}
                  disabled={loading}
                  data-testid={`${TEST_ID}-filter-input`}
                />
              </FlexItem>
            </Row>
          </FormField>
        </FlexItem>
      </Row>

      <Row align="center" gap="m">
        <FlexItem grow>
          <CommandPreview command={preview ?? ''} />
        </FlexItem>
        <FlexItem grow={false}>
          <RiTooltip content="Reset form" position="top">
            <IconButton
              size="M"
              icon={ResetIcon}
              onClick={handleReset}
              disabled={loading}
              aria-label="Reset similarity search form"
              data-testid={`${TEST_ID}-reset`}
            />
          </RiTooltip>
        </FlexItem>
        <FlexItem grow={false}>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={submitDisabled}
            loading={submitLoading}
            data-testid={`${TEST_ID}-submit`}
          >
            Find similar items
          </PrimaryButton>
        </FlexItem>
      </Row>
    </FormContainer>
  )
}
