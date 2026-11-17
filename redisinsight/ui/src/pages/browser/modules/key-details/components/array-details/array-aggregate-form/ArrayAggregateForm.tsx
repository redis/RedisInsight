import React, { useMemo, useState } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { IconButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { ResetIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { TextInput } from 'uiSrc/components/base/inputs'
import { defaultValueRender } from 'uiSrc/components/base/forms/select/RiSelect'
import { parseArrayIndex } from 'uiSrc/utils/arrayIndex'
import { ArrayAggregateOperation } from 'uiSrc/slices/interfaces/array'
import {
  CommandPreview,
  PreviewToggle,
  useResponsivePreviewLabel,
} from 'uiSrc/pages/browser/modules/key-details/shared'

import { useTranslation } from 'uiSrc/i18n'

import { ARRAY_COMMAND_PREVIEW_TEST_ID } from '../constants'
import * as RangeStyles from '../array-range-form/ArrayRangeForm.styles'
import * as S from './ArrayAggregateForm.styles'
import {
  ARRAY_AGGREGATE_FORM_TEST_ID as TEST_ID,
  ARRAY_RANGE_MAX_SPAN,
  INVALID_INDEX_MESSAGE,
  INVALID_RANGE_TOO_LARGE_MESSAGE,
  OPERATION_OPTIONS,
  RESET_TOOLTIP,
  RUN_BUTTON_LABEL,
} from './ArrayAggregateForm.constants'
import { ArrayAggregateFormProps } from './ArrayAggregateForm.types'

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
  const { t } = useTranslation()
  const [previewVisible, setPreviewVisible] = useState(false)
  const { containerRef, isWide } = useResponsivePreviewLabel()

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

  // MATCH accepts any RedisString — including empty strings / empty buffers
  // — so populated zero-length slots can be counted. The BE only rejects an
  // omitted `value` field, which the form never produces (defaults to '').
  const formInvalid = startInvalid || endInvalid || spanInvalid

  const startError = startInvalid ? t(INVALID_INDEX_MESSAGE) : undefined
  const endError = endInvalid
    ? t(INVALID_INDEX_MESSAGE)
    : spanInvalid
      ? t(INVALID_RANGE_TOO_LARGE_MESSAGE)
      : undefined

  const command = useMemo(() => {
    const name = keyName ? quoteRedisArgument(keyName) : '<key>'
    const base = `AROP ${name} ${start} ${end} ${operation}`
    if (operation === ArrayAggregateOperation.Match) {
      return `${base} ${quoteRedisArgument(value)}`
    }
    return base
  }, [keyName, start, end, operation, value])

  return (
    <RangeStyles.FormContainer data-testid={TEST_ID} gap="m" grow={false}>
      <Row align="end" gap="m">
        <FlexItem>
          <FormField label={t('browser.array.form.startIndex')}>
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
          <FormField label={t('browser.array.form.endIndex')}>
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
          <FormField label={t('browser.array.aggregate.operationLabel')}>
            <S.OperationSelect
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
            <FormField label={t('browser.array.aggregate.valueLabel')}>
              <TextInput
                value={value}
                onChange={onChangeValue}
                data-testid={`${TEST_ID}-value`}
                placeholder={t('browser.array.aggregate.valuePlaceholder')}
                disabled={disabled}
              />
            </FormField>
          </FlexItem>
        )}
      </Row>

      <RangeStyles.ActionRow ref={containerRef}>
        <FlexItem grow={false}>
          <PreviewToggle
            pressed={previewVisible}
            onPressedChange={setPreviewVisible}
            wide={isWide}
            data-testid={`${TEST_ID}-preview-toggle`}
          />
        </FlexItem>
        <FlexItem grow>
          {previewVisible && (
            <CommandPreview
              command={command}
              data-testid={ARRAY_COMMAND_PREVIEW_TEST_ID}
            />
          )}
        </FlexItem>
        {onReset && (
          <FlexItem grow={false}>
            <RiTooltip content={t(RESET_TOOLTIP)} position="top">
              <IconButton
                size="M"
                icon={ResetIcon}
                onClick={onReset}
                disabled={loading || disabled}
                aria-label={t('browser.array.aggregate.resetAria')}
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
            {t(RUN_BUTTON_LABEL)}
          </PrimaryButton>
        </FlexItem>
      </RangeStyles.ActionRow>
    </RangeStyles.FormContainer>
  )
}
