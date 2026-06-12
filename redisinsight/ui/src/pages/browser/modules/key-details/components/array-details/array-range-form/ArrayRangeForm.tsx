import React, { useMemo, useState } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { IconButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { ResetIcon, RiIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { TextInput } from 'uiSrc/components/base/inputs'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { Text } from 'uiSrc/components/base/text'
import { isValidArrayIndex } from 'uiSrc/utils/arrayIndex'

import { CommandPreview } from '../command-preview'
import {
  ARRAY_RANGE_FORM_TEST_ID as TEST_ID,
  INVALID_INDEX_MESSAGE,
  INVALID_ORDER_MESSAGE,
  PREVIEW_TOGGLE_ARIA_LABEL,
  PREVIEW_TOGGLE_HIDE_TOOLTIP,
  PREVIEW_TOGGLE_LABEL,
  PREVIEW_TOGGLE_SHOW_TOOLTIP,
  RESET_TOOLTIP,
  RUN_BUTTON_LABEL,
} from './ArrayRangeForm.constants'
import { ArrayRangeFormProps } from './ArrayRangeForm.types'
import * as S from './ArrayRangeForm.styles'

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
}: ArrayRangeFormProps) => {
  const [previewVisible, setPreviewVisible] = useState(false)

  const startInvalid = !isValidArrayIndex(start)
  const endInvalid = !isValidArrayIndex(end)
  const orderInvalid =
    !startInvalid && !endInvalid && BigInt(start) > BigInt(end)
  const rangeInvalid = startInvalid || endInvalid || orderInvalid

  const startError = startInvalid ? INVALID_INDEX_MESSAGE : undefined
  const endError = endInvalid
    ? INVALID_INDEX_MESSAGE
    : orderInvalid
      ? INVALID_ORDER_MESSAGE
      : undefined

  const command = useMemo(() => {
    // Always surface the command verb so the preview is meaningful even
    // before a key is selected; substitute a placeholder for the key.
    const name = keyName || '<key>'
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
                disabled={loading}
                aria-label="Reset array range form"
                data-testid={`${TEST_ID}-reset`}
              />
            </RiTooltip>
          </FlexItem>
        )}
        <FlexItem grow={false}>
          <PrimaryButton
            onClick={() => onRun()}
            disabled={rangeInvalid || loading}
            data-testid={`${TEST_ID}-run`}
          >
            {RUN_BUTTON_LABEL}
          </PrimaryButton>
        </FlexItem>
      </S.ActionRow>
    </S.FormContainer>
  )
}
