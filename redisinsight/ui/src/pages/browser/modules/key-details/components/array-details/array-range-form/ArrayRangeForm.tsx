import React, { useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { RiTooltip } from 'uiSrc/components'
import ConfirmationPopover from 'uiSrc/components/confirmation-popover'
import {
  DestructiveButton,
  IconButton,
  PrimaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { DeleteIcon, ResetIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { TextInput } from 'uiSrc/components/base/inputs'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { parseArrayIndex } from 'uiSrc/utils/arrayIndex'
import { DEFAULT_SCAN_LIMIT } from 'uiSrc/slices/browser/array'

import { CommandPreview } from '../command-preview'
import { PreviewToggle } from '../preview-toggle'
import { useResponsivePreviewLabel } from '../hooks'
import { quoteRedisArgument } from '../utils'
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
 * reset, an optional destructive Delete range, and the primary Run button —
 * matching the Vector Set similarity-search form pattern so the two
 * verticals feel like siblings.
 *
 * - `Start` / `End` are decimal-string indexes (BigInt-as-string contract).
 * - `Show empty indexes` ON  → ARGETRANGE (returns `null` for gaps).
 * - `Show empty indexes` OFF → ARSCAN (skips gaps; `Limit` caps result size).
 * - `Delete range` → ARDELRANGE over the same [start, end] inputs.
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
  onDeleteRange,
  disabled = false,
}: ArrayRangeFormProps) => {
  const { t } = useTranslation()
  const [previewVisible, setPreviewVisible] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const { containerRef, isWide } = useResponsivePreviewLabel()

  // A delete confirm left open across a key switch (or while the newly
  // clicked key's type is still unconfirmed) must not carry over: the
  // inputs reset for the new key, so confirming would run ARDELRANGE
  // against it with stale or default bounds.
  useEffect(() => {
    setDeleteConfirmOpen(false)
  }, [keyName, disabled])

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

  const startError = startInvalid ? INVALID_INDEX_MESSAGE : undefined
  const endError = endInvalid
    ? INVALID_INDEX_MESSAGE
    : spanInvalid
      ? INVALID_RANGE_TOO_LARGE_MESSAGE
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

  // No span cap here on purpose: the 1M cap protects the view response
  // size (ARGETRANGE), while ARDELRANGE accepts any inclusive window —
  // deleting 0..10M without loading it first is a supported flow.
  const deleteDisabled = startInvalid || endInvalid || loading || disabled

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
          <S.InputAlignedBox align="center">
            <Checkbox
              id={`${TEST_ID}-show-empty`}
              name="show-empty-indexes"
              label="Show empty indexes"
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
        {onDeleteRange && (
          <FlexItem grow={false}>
            <ConfirmationPopover
              anchorPosition="downCenter"
              ownFocus
              isOpen={deleteConfirmOpen}
              closePopover={() => setDeleteConfirmOpen(false)}
              panelPaddingSize="m"
              title={t('browser.array.delete.range.title')}
              message={t('browser.array.delete.range.message', { start, end })}
              button={
                <DestructiveButton
                  icon={DeleteIcon}
                  onClick={() => setDeleteConfirmOpen((open) => !open)}
                  disabled={deleteDisabled}
                  data-testid={`${TEST_ID}-delete`}
                >
                  {t('browser.array.delete.range.trigger')}
                </DestructiveButton>
              }
              confirmButton={
                <DestructiveButton
                  size="small"
                  icon={DeleteIcon}
                  disabled={deleteDisabled}
                  onClick={() => {
                    onDeleteRange()
                    setDeleteConfirmOpen(false)
                  }}
                  data-testid={`${TEST_ID}-delete-confirm`}
                >
                  {t('browser.array.delete.range.button')}
                </DestructiveButton>
              }
            />
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
