import React, { useMemo, useState } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { IconButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { ResetIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { TextInput } from 'uiSrc/components/base/inputs'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { parseArrayIndex } from 'uiSrc/utils/arrayIndex'
import { DEFAULT_SCAN_LIMIT } from 'uiSrc/slices/browser/array'
import {
  CommandPreview,
  PreviewToggle,
  useResponsivePreviewLabel,
} from 'uiSrc/pages/browser/modules/key-details/shared'

import { useTranslation } from 'uiSrc/i18n'

import { quoteRedisArgument } from '../utils'
import { ARRAY_COMMAND_PREVIEW_TEST_ID } from '../constants'
import {
  ARRAY_RANGE_FORM_TEST_ID as TEST_ID,
  ARRAY_RANGE_MAX_SPAN,
  INVALID_INDEX_MESSAGE,
  INVALID_RANGE_TOO_LARGE_MESSAGE,
  RESET_TOOLTIP,
  RUN_BUTTON_LABEL,
} from './ArrayRangeForm.constants'
import { ArrayRangeFormProps } from './ArrayRangeForm.types'
import * as S from './ArrayRangeForm.styles'

/**
 * Range/scan query form for the array View tab. Lays out inputs above a
 * single action row containing a toggleable command preview, an optional
 * reset, and the primary Run button — matching the Vector Set
 * similarity-search form pattern so the two verticals feel like siblings.
 * The destructive Delete range action lives in the View tab subheader
 * (`DeleteRangeAction`) next to Add Elements, not in this form.
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
  const { t } = useTranslation()
  const [previewVisible, setPreviewVisible] = useState(false)
  const { containerRef, isWide } = useResponsivePreviewLabel()

  // Match the backend's @IsArrayIndex validator exactly: accept only
  // canonical decimal strings (no leading zeros, no whitespace, etc.).
  // Loose-acceptance values like "007" or " 7 " would pass `parseArrayIndex`
  // but be rejected with a 400 once the request reaches the API.
  const startInvalid = parseArrayIndex(start) !== start
  const endInvalid = parseArrayIndex(end) !== end
  // Mirror the backend's ARRAY_RANGE_MAX_ELEMENTS cap so we fail fast
  // instead of round-tripping a request that will 400. Span is
  // (|end - start| + 1) per the inclusive-bounds contract — reversed
  // ranges (start > end) are valid and return elements in reverse order.
  //
  // Only applied to ARGETRANGE (`showEmpty: true`). ARSCAN skips empty
  // slots server-side and intentionally has no span cap — sparse arrays
  // are routinely browsed with ranges far larger than 1M; LIMIT is the
  // natural backpressure there.
  const spanInvalid =
    showEmpty &&
    !startInvalid &&
    !endInvalid &&
    (BigInt(start) > BigInt(end)
      ? BigInt(start) - BigInt(end)
      : BigInt(end) - BigInt(start)) +
      1n >
      ARRAY_RANGE_MAX_SPAN
  const rangeInvalid = startInvalid || endInvalid || spanInvalid

  const startError = startInvalid ? t(INVALID_INDEX_MESSAGE) : undefined
  const endError = endInvalid
    ? t(INVALID_INDEX_MESSAGE)
    : spanInvalid
      ? t(INVALID_RANGE_TOO_LARGE_MESSAGE)
      : undefined

  const command = useMemo(() => {
    // Always surface the command verb so the preview is meaningful even
    // before a key is selected; substitute a placeholder for the key.
    // Quote the key so binary-unsafe names (whitespace, quotes) stay
    // runnable when copied into CLI / Workbench.
    //
    // ARSCAN includes the same `LIMIT` the slice thunk pins to every
    // request — without it, the copied command would issue an unbounded
    // ARSCAN against CLI/Workbench and return far more rows than what
    // Run actually executes.
    const name = keyName ? quoteRedisArgument(keyName) : '<key>'
    if (showEmpty) return `ARGETRANGE ${name} ${start} ${end}`
    return `ARSCAN ${name} ${start} ${end} LIMIT ${DEFAULT_SCAN_LIMIT}`
  }, [keyName, start, end, showEmpty])

  return (
    <S.FormContainer data-testid={TEST_ID} gap="m" grow={false}>
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
          <S.InputAlignedBox align="center">
            <Checkbox
              id={`${TEST_ID}-show-empty`}
              name="show-empty-indexes"
              label={t('browser.array.range.showEmpty')}
              checked={showEmpty}
              onChange={(e) => onToggleShowEmpty(e.target.checked)}
              data-testid={`${TEST_ID}-show-empty`}
              disabled={disabled}
            />
          </S.InputAlignedBox>
        </FlexItem>
      </Row>

      <S.ActionRow ref={containerRef}>
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
                aria-label={t('browser.array.range.resetAria')}
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
            {t(RUN_BUTTON_LABEL)}
          </PrimaryButton>
        </FlexItem>
      </S.ActionRow>
    </S.FormContainer>
  )
}
