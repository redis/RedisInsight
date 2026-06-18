import React, { useMemo, useState } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { IconButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { ResetIcon, RiIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { TextInput } from 'uiSrc/components/base/inputs'
import { Text } from 'uiSrc/components/base/text'
import {
  defaultValueRender,
  RiSelect,
} from 'uiSrc/components/base/forms/select/RiSelect'
import { parseArrayIndex } from 'uiSrc/utils/arrayIndex'
import { ArrayAggregateOperation } from 'uiSrc/slices/interfaces/array'

import { CommandPreview } from '../command-preview'
import * as RangeStyles from '../array-range-form/ArrayRangeForm.styles'
import {
  ARRAY_AGGREGATE_FORM_TEST_ID as TEST_ID,
  ARRAY_RANGE_MAX_SPAN,
  INVALID_INDEX_MESSAGE,
  INVALID_MATCH_VALUE_MESSAGE,
  INVALID_RANGE_TOO_LARGE_MESSAGE,
  OPERATION_OPTIONS,
  RESET_TOOLTIP,
  RUN_BUTTON_LABEL,
} from './ArrayAggregateForm.constants'
import { ArrayAggregateFormProps } from './ArrayAggregateForm.types'

const PREVIEW_TOGGLE_LABEL = 'Show preview'
const PREVIEW_TOGGLE_ARIA_LABEL = 'Toggle command preview'
const PREVIEW_TOGGLE_SHOW_TOOLTIP = 'Show the Redis command that will run'
const PREVIEW_TOGGLE_HIDE_TOOLTIP = 'Hide the command preview'

// Mirrors `ArrayRangeForm`'s helper — same redis-cli quoting rules so a
// copied preview command stays runnable for binary-unsafe keys / values.
const quoteRedisArgument = (value: string): string => {
  if (value.length === 0) return '""'
  if (!/[\s"\\]/.test(value)) return value
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

/**
 * AROP form for the array Aggregate tab. Lays out range inputs + operation
 * select above the standard action row (preview toggle, reset, Run) so the
 * tab feels like a sibling of the View tab's `ArrayRangeForm`. The
 * comparison-value input only appears for `operation === Match`.
 */
export const ArrayAggregateForm = ({
  keyName,
  start,
  end,
  operation,
  value,
  loading,
  onChangeStart,
  onChangeEnd,
  onChangeOperation,
  onChangeValue,
  onRun,
  onReset,
  disabled = false,
}: ArrayAggregateFormProps) => {
  const [previewVisible, setPreviewVisible] = useState(false)

  const startInvalid = parseArrayIndex(start) !== start
  const endInvalid = parseArrayIndex(end) !== end
  const spanInvalid =
    !startInvalid &&
    !endInvalid &&
    (BigInt(start) > BigInt(end)
      ? BigInt(start) - BigInt(end)
      : BigInt(end) - BigInt(start)) +
      1n >
      ARRAY_RANGE_MAX_SPAN

  const matchValueInvalid =
    operation === ArrayAggregateOperation.Match && value.trim() === ''

  const formInvalid =
    startInvalid || endInvalid || spanInvalid || matchValueInvalid

  const startError = startInvalid ? INVALID_INDEX_MESSAGE : undefined
  const endError = endInvalid
    ? INVALID_INDEX_MESSAGE
    : spanInvalid
      ? INVALID_RANGE_TOO_LARGE_MESSAGE
      : undefined
  const valueError = matchValueInvalid ? INVALID_MATCH_VALUE_MESSAGE : undefined

  const command = useMemo(() => {
    const name = keyName ? quoteRedisArgument(keyName) : '<key>'
    const base = `AROP ${name} ${start} ${end} ${operation}`
    if (operation === ArrayAggregateOperation.Match) {
      return `${base} ${quoteRedisArgument(value)}`
    }
    return base
  }, [keyName, start, end, operation, value])

  const previewTooltip = previewVisible
    ? PREVIEW_TOGGLE_HIDE_TOOLTIP
    : PREVIEW_TOGGLE_SHOW_TOOLTIP

  return (
    <RangeStyles.FormContainer data-testid={TEST_ID} gap="m" grow={false}>
      <Row align="end" gap="m">
        <FlexItem>
          <FormField label="Start index">
            <TextInput
              value={start}
              onChange={onChangeStart}
              data-testid={`${TEST_ID}-start`}
              error={startError}
              placeholder="0"
              disabled={disabled}
            />
          </FormField>
        </FlexItem>
        <FlexItem>
          <FormField label="End index">
            <TextInput
              value={end}
              onChange={onChangeEnd}
              data-testid={`${TEST_ID}-end`}
              error={endError}
              placeholder="9"
              disabled={disabled}
            />
          </FormField>
        </FlexItem>
        <FlexItem grow={false}>
          <FormField label="Operation">
            <RiSelect
              options={OPERATION_OPTIONS.map((option) => ({
                ...option,
                'data-test-subj': `${TEST_ID}-operation-option-${option.value}`,
              }))}
              value={operation}
              valueRender={defaultValueRender}
              onChange={(next) =>
                onChangeOperation(next as ArrayAggregateOperation)
              }
              disabled={disabled}
              data-test-subj={`${TEST_ID}-operation`}
            />
          </FormField>
        </FlexItem>
        {operation === ArrayAggregateOperation.Match && (
          <FlexItem>
            <FormField label="Value">
              <TextInput
                value={value}
                onChange={onChangeValue}
                data-testid={`${TEST_ID}-value`}
                error={valueError}
                placeholder="value to match"
                disabled={disabled}
              />
            </FormField>
          </FlexItem>
        )}
      </Row>

      <RangeStyles.ActionRow align="center" gap="m">
        <FlexItem grow={false}>
          <RiTooltip content={previewTooltip} position="top">
            <RangeStyles.PreviewToggleButton
              pressed={previewVisible}
              onPressedChange={setPreviewVisible}
              aria-label={PREVIEW_TOGGLE_ARIA_LABEL}
              data-testid={`${TEST_ID}-preview-toggle`}
            >
              <RiIcon size="m" type="CliIcon" />
              <Text size="s">{PREVIEW_TOGGLE_LABEL}</Text>
            </RangeStyles.PreviewToggleButton>
          </RiTooltip>
        </FlexItem>
        <FlexItem grow>
          {previewVisible && <CommandPreview command={command} />}
        </FlexItem>
        {onReset && (
          <FlexItem grow={false}>
            <RiTooltip content={RESET_TOOLTIP} position="top">
              <IconButton
                size="M"
                icon={ResetIcon}
                onClick={onReset}
                disabled={loading || disabled}
                aria-label="Reset array aggregate form"
                data-testid={`${TEST_ID}-reset`}
              />
            </RiTooltip>
          </FlexItem>
        )}
        <FlexItem grow={false}>
          <PrimaryButton
            onClick={() => onRun()}
            disabled={formInvalid || loading || disabled}
            data-testid={`${TEST_ID}-run`}
          >
            {RUN_BUTTON_LABEL}
          </PrimaryButton>
        </FlexItem>
      </RangeStyles.ActionRow>
    </RangeStyles.FormContainer>
  )
}
