import React, { useMemo, useState } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { TextInput } from 'uiSrc/components/base/inputs'
import { Text } from 'uiSrc/components/base/text'
import { ArrayGrepCriteria } from 'uiSrc/slices/interfaces/array'
import { DEFAULT_SEARCH_LIMIT } from 'uiSrc/slices/browser/array'

import { CommandPreview } from '../command-preview'
import { quoteRedisArgument } from '../utils'
import {
  ARRAY_GREP_CRITERIA_OPTIONS,
  ARRAY_SEARCH_FORM_TEST_ID as TEST_ID,
  CRITERIA_LABEL,
  PREVIEW_TOGGLE_ARIA_LABEL,
  PREVIEW_TOGGLE_HIDE_TOOLTIP,
  PREVIEW_TOGGLE_LABEL,
  PREVIEW_TOGGLE_SHOW_TOOLTIP,
  RUN_BUTTON_LABEL,
  VALUE_LABEL,
  VALUE_PLACEHOLDER,
} from './ArraySearchForm.constants'
import { ArraySearchFormProps } from './ArraySearchForm.types'
import * as S from './ArraySearchForm.styles'

/**
 * Single-predicate ARGREP search form for the array Search tab. Lays out a
 * criteria dropdown and a value input above a single action row containing a
 * toggleable command preview and the primary Run button — matching the View
 * tab's `ArrayRangeForm` so the two verticals feel like siblings.
 */
export const ArraySearchForm = ({
  keyName,
  criteria,
  value,
  loading,
  onChangeCriteria,
  onChangeValue,
  onRun,
  disabled = false,
}: ArraySearchFormProps) => {
  const [previewVisible, setPreviewVisible] = useState(false)

  const command = useMemo(() => {
    // Mirror the command the backend builds from what the thunk sends:
    // whole-array bounds (`- +`), the default WITHVALUES, and the safety
    // LIMIT. Quote the key and value so binary-unsafe content stays runnable
    // when copied out.
    const name = keyName ? quoteRedisArgument(keyName) : '<key>'
    return `ARGREP ${name} - + ${criteria} ${quoteRedisArgument(value)} WITHVALUES LIMIT ${DEFAULT_SEARCH_LIMIT}`
  }, [keyName, criteria, value])

  const previewTooltip = previewVisible
    ? PREVIEW_TOGGLE_HIDE_TOOLTIP
    : PREVIEW_TOGGLE_SHOW_TOOLTIP

  return (
    <S.FormContainer data-testid={TEST_ID} gap="m" grow={false}>
      <Row align="end" gap="m">
        <FlexItem grow={false}>
          <FormField label={CRITERIA_LABEL}>
            <S.CriteriaSelect
              value={criteria}
              options={ARRAY_GREP_CRITERIA_OPTIONS}
              onChange={(next: string) =>
                onChangeCriteria(next as ArrayGrepCriteria)
              }
              disabled={disabled}
              data-testid={`${TEST_ID}-criteria`}
            />
          </FormField>
        </FlexItem>
        <FlexItem grow>
          <FormField label={VALUE_LABEL}>
            <TextInput
              value={value}
              onChange={onChangeValue}
              // Enter mirrors the Run button so the single-field form works
              // as a search box; gated on the same conditions as Run.
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && !disabled) onRun()
              }}
              placeholder={VALUE_PLACEHOLDER}
              disabled={disabled}
              data-testid={`${TEST_ID}-value`}
            />
          </FormField>
        </FlexItem>
      </Row>

      <S.ActionRow align="center" gap="m">
        <FlexItem grow={false}>
          <RiTooltip content={previewTooltip} position="top">
            <S.PreviewToggleButton
              pressed={previewVisible}
              onPressedChange={setPreviewVisible}
              aria-label={PREVIEW_TOGGLE_ARIA_LABEL}
              data-testid={`${TEST_ID}-preview-toggle`}
            >
              <RiIcon size="m" type="CliIcon" />
              <Text size="s">{PREVIEW_TOGGLE_LABEL}</Text>
            </S.PreviewToggleButton>
          </RiTooltip>
        </FlexItem>
        <FlexItem grow>
          {previewVisible && <CommandPreview command={command} />}
        </FlexItem>
        <FlexItem grow={false}>
          <PrimaryButton
            onClick={() => onRun()}
            disabled={loading || disabled}
            data-testid={`${TEST_ID}-run`}
          >
            {RUN_BUTTON_LABEL}
          </PrimaryButton>
        </FlexItem>
      </S.ActionRow>
    </S.FormContainer>
  )
}
