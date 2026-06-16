import React, { useMemo, useState } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { IconButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { ResetIcon, RiIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { TextInput } from 'uiSrc/components/base/inputs'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { Text } from 'uiSrc/components/base/text'
import { parseArrayIndex } from 'uiSrc/utils/arrayIndex'

import { CommandPreview } from '../command-preview'
import {
  ARRAY_RANGE_FORM_TEST_ID as TEST_ID,
  ARRAY_RANGE_MAX_SPAN,
  INVALID_INDEX_MESSAGE,
  INVALID_ORDER_MESSAGE,
  INVALID_RANGE_TOO_LARGE_MESSAGE,
  PREVIEW_TOGGLE_ARIA_LABEL,
  PREVIEW_TOGGLE_HIDE_TOOLTIP,
  PREVIEW_TOGGLE_LABEL,
  PREVIEW_TOGGLE_SHOW_TOOLTIP,
  RESET_TOOLTIP,
  RUN_BUTTON_LABEL,
} from './ArrayRangeForm.constants'
import { ArrayRangeFormProps } from './ArrayRangeForm.types'
import * as S from './ArrayRangeForm.styles'

// Wraps a Redis argument that may contain whitespace or quotes so the
// preview text stays runnable when copied into CLI / Workbench. Mirrors
// the same escaping rules the redis-cli parser applies to double-quoted
// strings: backslash and double-quote get backslash-escaped.
const quoteRedisArgument = (value: string): string => {
  if (value.length === 0) return '""'
  if (!/[\s"\\]/.test(value)) return value
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

/**
 * Range/scan query form for the array View tab. Lays out inputs above a
 * single action row containing a toggleable command preview, an optional
 * reset, and the primary Run button — matching the Vector Set similarity-
 * search form pattern so the two verticals feel like siblings.
 *
 * - `Start` / `End` are decimal-string indexes (BigInt-as-string contract).
 * - `Show empty indexes` ON  → ARGETRANGE (returns `null` for gaps).
 * - `Show empty indexes` OFF → ARSCAN (skips gaps; `Limit` caps result size).
 */
export const ArrayRangeForm = ({
  keyName,
  start,
  end,
  showEmpty,
  loading,
  onChangeStart,
  onChangeEnd,
  onToggleShowEmpty,
  onRun,
  onReset,
  disabled = false,
}: ArrayRangeFormProps) => {
  const [previewVisible, setPreviewVisible] = useState(false)

  // Match the backend's @IsArrayIndex validator exactly: accept only
  // canonical decimal strings (no leading zeros, no whitespace, etc.).
  // Loose-acceptance values like "007" or " 7 " would pass `parseArrayIndex`
  // but be rejected with a 400 once the request reaches the API.
  const startInvalid = parseArrayIndex(start) !== start
  const endInvalid = parseArrayIndex(end) !== end
  // Reversed ranges (start > end) are rejected by the backend (matches
  // every Redis range command). Surface the constraint inline.
  const orderInvalid =
    !startInvalid && !endInvalid && BigInt(start) > BigInt(end)
  // Mirror the backend's ARRAY_RANGE_MAX_ELEMENTS cap so we fail fast
  // instead of round-tripping a request that will 400. Span is
  // (end - start + 1) per the inclusive-bounds contract.
  const spanInvalid =
    !startInvalid &&
    !endInvalid &&
    !orderInvalid &&
    BigInt(end) - BigInt(start) + 1n > ARRAY_RANGE_MAX_SPAN
  const rangeInvalid = startInvalid || endInvalid || orderInvalid || spanInvalid

  const startError = startInvalid ? INVALID_INDEX_MESSAGE : undefined
  const endError = endInvalid
    ? INVALID_INDEX_MESSAGE
    : orderInvalid
      ? INVALID_ORDER_MESSAGE
      : spanInvalid
        ? INVALID_RANGE_TOO_LARGE_MESSAGE
        : undefined

  const command = useMemo(() => {
    // Always surface the command verb so the preview is meaningful even
    // before a key is selected; substitute a placeholder for the key.
    // Quote the key so binary-unsafe names (whitespace, quotes) stay
    // runnable when copied into CLI / Workbench.
    const name = keyName ? quoteRedisArgument(keyName) : '<key>'
    const verb = showEmpty ? 'ARGETRANGE' : 'ARSCAN'
    return `${verb} ${name} ${start} ${end}`
  }, [keyName, start, end, showEmpty])

  const previewTooltip = previewVisible
    ? PREVIEW_TOGGLE_HIDE_TOOLTIP
    : PREVIEW_TOGGLE_SHOW_TOOLTIP

  return (
    <S.FormContainer data-testid={TEST_ID} gap="m" grow={false}>
      <Row align="end" gap="m">
        <FlexItem>
          <FormField label="Start index">
            <TextInput
              value={start}
              onChange={onChangeStart}
              data-testid={`${TEST_ID}-start`}
              error={startError}
              placeholder="0"
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
            />
          </FormField>
        </FlexItem>
        <FlexItem grow={false}>
          <S.InputAlignedBox>
            <Checkbox
              id={`${TEST_ID}-show-empty`}
              name="show-empty-indexes"
              label="Show empty indexes"
              checked={showEmpty}
              onChange={(e) => onToggleShowEmpty(e.target.checked)}
              data-testid={`${TEST_ID}-show-empty`}
            />
          </S.InputAlignedBox>
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
        {onReset && (
          <FlexItem grow={false}>
            <RiTooltip content={RESET_TOOLTIP} position="top">
              <IconButton
                size="M"
                icon={ResetIcon}
                onClick={onReset}
                disabled={loading || disabled}
                aria-label="Reset array range form"
                data-testid={`${TEST_ID}-reset`}
              />
            </RiTooltip>
          </FlexItem>
        )}
        <FlexItem grow={false}>
          <PrimaryButton
            onClick={() => onRun()}
            disabled={rangeInvalid || loading || disabled}
            data-testid={`${TEST_ID}-run`}
          >
            {RUN_BUTTON_LABEL}
          </PrimaryButton>
        </FlexItem>
      </S.ActionRow>
    </S.FormContainer>
  )
}
