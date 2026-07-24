import React, { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { RiTooltip } from 'uiSrc/components'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'
import { IconButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { InfoIcon, ResetIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { TextInput, QuantityCounter } from 'uiSrc/components/base/inputs'
import { vectorSetAttributeKeysSelector } from 'uiSrc/slices/browser/vectorSet'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  CommandPreview,
  PreviewToggle,
  useResponsivePreviewLabel,
} from 'uiSrc/pages/browser/modules/key-details/shared'
import { useTranslation } from 'uiSrc/i18n'

import { VectorSetSimilarityInputMode } from '../../telemetry.constants'
import { getVectorFieldInfo } from '../../vector-set-element-form/utils'
import { useSimilaritySearch } from '../../hooks/useSimilaritySearch'

import { FilterInputWithSuggestions } from '../filter-input-with-suggestions'
import { FilterSyntaxHelpPopover } from '../filter-syntax-help-popover'
import * as S from './SimilaritySearchForm.styles'
import {
  COMMAND_PREVIEW_TEST_ID,
  ELEMENT_MODE_TOOLTIP,
  ELEMENT_PLACEHOLDER,
  FILTER_PLACEHOLDER,
  QUERY_NOT_READY_TOOLTIP,
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
  const { t } = useTranslation()
  const {
    loading,
    previewLoading,
    vectorDim,
    preview,
    runSimilaritySearch,
    runSimilaritySearchPreview,
    cancelSimilaritySearchPreview,
    resetSimilaritySearch,
  } = useSimilaritySearch()

  const [state, setState] =
    useState<SimilaritySearchFormState>(initialFormState)

  const [previewVisible, setPreviewVisible] = useState(false)
  const { containerRef, isWide } = useResponsivePreviewLabel()

  const { id: databaseId } = useAppSelector(connectedInstanceSelector)
  const attributeKeys = useAppSelector(vectorSetAttributeKeysSelector)

  // React to external prefill requests: switch to Element mode and seed the
  // element input. Keyed on `nonce` so re-requesting the same value still
  // re-applies the prefill (e.g. clicking the same row's search icon twice).
  useEffect(() => {
    if (!prefillElement) return
    setState((prev) => ({
      ...prev,
      mode: SimilaritySearchMode.Element,
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

  useEffect(() => {
    if (!previewVisible) return
    runSimilaritySearchPreview(state)
  }, [state, runSimilaritySearchPreview, previewVisible])

  const togglePreview = (next: boolean) => {
    sendEventTelemetry({
      event:
        TelemetryEvent.VECTOR_SET_SIMILARITY_SEARCH_COMMAND_PREVIEW_TOGGLED,
      eventData: {
        databaseId,
        state: next ? 'shown' : 'hidden',
      },
    })
    if (!next) {
      cancelSimilaritySearchPreview()
    }
    setPreviewVisible(next)
  }

  const vectorFieldInfo = useMemo(
    () => getVectorFieldInfo(state.vectorInput, vectorDim, t),
    [state.vectorInput, vectorDim, t],
  )

  const queryReady = isQueryReady(state, vectorDim)
  const isLoading = loading || previewLoading
  const submitDisabled = isLoading || !queryReady

  const handleSubmit = () => {
    if (!queryReady) return
    sendEventTelemetry({
      event: TelemetryEvent.VECTOR_SET_SIMILARITY_SEARCH_SUBMITTED,
      eventData: {
        databaseId,
        inputMode:
          state.mode === SimilaritySearchMode.Vector
            ? VectorSetSimilarityInputMode.Vector
            : VectorSetSimilarityInputMode.Element,
        count: state.count ?? SIMILARITY_SEARCH_COUNT_DEFAULT,
        hasAttributeFilter: state.filter.trim().length > 0,
      },
    })
    runSimilaritySearch(state)
  }

  const handleReset = () => {
    sendEventTelemetry({
      event: TelemetryEvent.VECTOR_SET_SIMILARITY_SEARCH_FORM_RESET,
      eventData: { databaseId },
    })
    setState(initialFormState())
    resetSimilaritySearch()
  }

  return (
    <S.FormContainer data-testid={TEST_ID} gap="m" grow={false}>
      <Row align="center" gap="m">
        <FlexItem grow={false}>
          <ButtonGroup data-testid={`${TEST_ID}-mode-toggle`}>
            <ButtonGroup.Button
              isSelected={state.mode === SimilaritySearchMode.Vector}
              onClick={() => setMode(SimilaritySearchMode.Vector)}
              data-testid={`${TEST_ID}-mode-vector`}
            >
              <S.ModeButtonContent>
                {t('browser.vectorSet.search.vectorMode')}
                <RiTooltip content={t(VECTOR_MODE_TOOLTIP)} position="top">
                  <S.ModeInfoIcon
                    aria-label={t(VECTOR_MODE_TOOLTIP)}
                    data-testid={`${TEST_ID}-mode-vector-info`}
                  >
                    <InfoIcon />
                  </S.ModeInfoIcon>
                </RiTooltip>
              </S.ModeButtonContent>
            </ButtonGroup.Button>
            <ButtonGroup.Button
              isSelected={state.mode === SimilaritySearchMode.Element}
              onClick={() => setMode(SimilaritySearchMode.Element)}
              data-testid={`${TEST_ID}-mode-element`}
            >
              <S.ModeButtonContent>
                {t('browser.vectorSet.search.elementMode')}
                <RiTooltip content={t(ELEMENT_MODE_TOOLTIP)} position="top">
                  <S.ModeInfoIcon
                    aria-label={t(ELEMENT_MODE_TOOLTIP)}
                    data-testid={`${TEST_ID}-mode-element-info`}
                  >
                    <InfoIcon />
                  </S.ModeInfoIcon>
                </RiTooltip>
              </S.ModeButtonContent>
            </ButtonGroup.Button>
          </ButtonGroup>
        </FlexItem>
        <FlexItem grow>
          {state.mode === SimilaritySearchMode.Vector ? (
            <FormField>
              <TextInput
                placeholder={t(VECTOR_PLACEHOLDER)}
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
                placeholder={t(ELEMENT_PLACEHOLDER)}
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
            <S.CountInlineLabel data-testid={`${TEST_ID}-count-label`}>
              Result count
            </S.CountInlineLabel>
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
              <S.FilterLabel>
                Filter expression
                <FilterSyntaxHelpPopover />
              </S.FilterLabel>
              <FlexItem grow>
                <FilterInputWithSuggestions
                  placeholder={FILTER_PLACEHOLDER}
                  value={state.filter}
                  onChange={(value) => setField('filter', value)}
                  disabled={loading}
                  suggestions={attributeKeys}
                  testId={`${TEST_ID}-filter-input`}
                />
              </FlexItem>
            </Row>
          </FormField>
        </FlexItem>
      </Row>

      <S.ActionRow ref={containerRef}>
        <FlexItem grow={false}>
          <PreviewToggle
            pressed={previewVisible}
            onPressedChange={togglePreview}
            wide={isWide}
            disabled={!queryReady && !previewVisible}
            disabledTooltip={t(QUERY_NOT_READY_TOOLTIP)}
            data-testid={`${TEST_ID}-preview-toggle`}
          />
        </FlexItem>
        <FlexItem grow>
          {previewVisible && (
            <CommandPreview
              command={preview ?? ''}
              loading={previewLoading}
              data-testid={COMMAND_PREVIEW_TEST_ID}
            />
          )}
        </FlexItem>
        <FlexItem grow={false}>
          <RiTooltip
            content={t('browser.vectorSet.search.resetTooltip')}
            position="top"
          >
            <IconButton
              size="M"
              icon={ResetIcon}
              onClick={handleReset}
              disabled={loading}
              aria-label={t('browser.vectorSet.search.resetAria')}
              data-testid={`${TEST_ID}-reset`}
            />
          </RiTooltip>
        </FlexItem>
        <FlexItem grow={false}>
          <RiTooltip
            content={!queryReady ? t(QUERY_NOT_READY_TOOLTIP) : null}
            position="top"
          >
            <PrimaryButton
              onClick={handleSubmit}
              disabled={submitDisabled}
              data-testid={`${TEST_ID}-submit`}
            >
              Find similar items
            </PrimaryButton>
          </RiTooltip>
        </FlexItem>
      </S.ActionRow>
    </S.FormContainer>
  )
}
