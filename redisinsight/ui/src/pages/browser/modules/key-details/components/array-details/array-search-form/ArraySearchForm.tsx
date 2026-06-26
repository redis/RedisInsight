import React, { useMemo, useState } from 'react'

import { RiTooltip } from 'uiSrc/components'
import {
  ActionIconButton,
  EmptyButton,
  IconButton,
  PrimaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'
import {
  DeleteIcon,
  PlusIcon,
  ResetIcon,
  RiIcon,
} from 'uiSrc/components/base/icons'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { NumericInput, TextInput } from 'uiSrc/components/base/inputs'
import { Text } from 'uiSrc/components/base/text'
import {
  ArrayCombinator,
  ArrayGrepCriteria,
} from 'uiSrc/slices/interfaces/array'

import { CommandPreview } from '../command-preview'
import {
  CONTEXT_COUNT_MAX,
  CONTEXT_COUNT_MIN,
  DEFAULT_LIMIT,
} from '../constants'
import { quoteRedisArgument } from '../utils'
import {
  ADD_PREDICATE_ARIA,
  APPLIES_TO_ALL_LABEL,
  ARRAY_GREP_CRITERIA_OPTIONS,
  ARRAY_SEARCH_FORM_TEST_ID as TEST_ID,
  COMBINATOR_ARIA,
  CONTEXT_HINT,
  CONTEXT_LABEL,
  CONTEXT_PREFIX,
  REMOVE_PREDICATE_ARIA,
  END_PLACEHOLDER,
  INVALID_INDEX_MESSAGE,
  INVALID_LIMIT_MESSAGE,
  LIMIT_HINT,
  LIMIT_LABEL,
  MATCH_BY_HINT,
  MATCH_BY_LABEL,
  NOCASE_HINT,
  NOCASE_LABEL,
  OPTIONS_HINT,
  OPTIONS_LABEL,
  PREVIEW_TOGGLE_ARIA_LABEL,
  PREVIEW_TOGGLE_HIDE_TOOLTIP,
  PREVIEW_TOGGLE_LABEL,
  PREVIEW_TOGGLE_SHOW_TOOLTIP,
  RANGE_HINT,
  RANGE_LABEL,
  RANGE_TO_LABEL,
  RESET_ARIA_LABEL,
  RESET_TOOLTIP,
  RUN_BUTTON_LABEL,
  START_PLACEHOLDER,
  VALUE_PLACEHOLDER,
  WITHVALUES_HINT,
  WITHVALUES_LABEL,
} from './ArraySearchForm.constants'
import { ArraySearchFormProps } from './ArraySearchForm.types'
import { isBoundInvalid, isLimitInvalid } from './ArraySearchForm.utils'
import { InfoHint } from './components/InfoHint'
import * as S from './ArraySearchForm.styles'

/**
 * Multi-predicate ARGREP search form for the array Search tab: a list of
 * criteria/value predicate rows (add via the "+" below the list, remove per
 * row once there are 2+), a single global AND/OR connective shown between
 * each pair of rows — every toggle drives the same value, so changing one
 * changes all (Redis has no per-predicate operators or nested boolean trees) —
 * and collapsible options (range / NOCASE / WITHVALUES / LIMIT). The command
 * preview reflects every predicate + option.
 */
export const ArraySearchForm = ({
  keyName,
  predicates,
  combinator,
  options,
  loading,
  onAddPredicate,
  onRemovePredicate,
  onChangePredicate,
  onChangeCombinator,
  onChangeOptions,
  context,
  onChangeContext,
  onRun,
  onReset,
  disabled = false,
}: ArraySearchFormProps) => {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)

  const multiPredicate = predicates.length > 1
  const startInvalid = isBoundInvalid(options.start)
  const endInvalid = isBoundInvalid(options.end)
  const limitInvalid = options.limitEnabled && isLimitInvalid(options.limit)
  const runDisabled =
    loading || disabled || startInvalid || endInvalid || limitInvalid

  const command = useMemo(() => {
    // Mirror the command the backend builds: whole-array bounds default to
    // `-`/`+`, the connective is shown only with 2+ predicates, NOCASE /
    // WITHVALUES reflect their toggles, and LIMIT is appended only when the
    // user ticks it — otherwise the search runs uncapped.
    const name = keyName ? quoteRedisArgument(keyName) : '<key>'
    const predicateTokens = predicates
      .map((p) => `${p.criteria} ${quoteRedisArgument(p.value)}`)
      .join(' ')

    const parts = [
      'ARGREP',
      name,
      options.start || '-',
      options.end || '+',
      predicateTokens,
    ]
    if (multiPredicate) parts.push(combinator)
    if (options.nocase) parts.push('NOCASE')
    if (options.withValues) parts.push('WITHVALUES')
    if (options.limitEnabled) parts.push('LIMIT', options.limit)
    return parts.join(' ')
  }, [keyName, predicates, combinator, options, multiPredicate])

  return (
    <S.FormContainer data-testid={TEST_ID} gap="m" grow={false}>
      <Row align="center" gap="xs" grow={false}>
        <FlexItem grow={false}>
          <Text size="s">{MATCH_BY_LABEL}</Text>
        </FlexItem>
        <FlexItem grow={false}>
          <InfoHint content={MATCH_BY_HINT} />
        </FlexItem>
      </Row>

      <Col gap="s" grow={false}>
        {predicates.map((predicate, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={index}>
            <Row align="center" gap="m">
              <FlexItem grow={false}>
                <S.CriteriaSelect
                  value={predicate.criteria}
                  options={ARRAY_GREP_CRITERIA_OPTIONS}
                  onChange={(next: string) =>
                    onChangePredicate(index, {
                      criteria: next as ArrayGrepCriteria,
                    })
                  }
                  disabled={disabled}
                  data-testid={`${TEST_ID}-criteria-${index}`}
                />
              </FlexItem>
              <FlexItem grow>
                <TextInput
                  value={predicate.value}
                  onChange={(value) => onChangePredicate(index, { value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !runDisabled) onRun()
                  }}
                  placeholder={VALUE_PLACEHOLDER}
                  disabled={disabled}
                  data-testid={`${TEST_ID}-value-${index}`}
                />
              </FlexItem>
              {/* No delete on a single row — there's nothing to remove. */}
              {multiPredicate && (
                <FlexItem grow={false}>
                  <RiTooltip content={REMOVE_PREDICATE_ARIA} position="left">
                    <IconButton
                      icon={DeleteIcon}
                      aria-label={REMOVE_PREDICATE_ARIA}
                      onClick={() => onRemovePredicate(index)}
                      disabled={disabled}
                      data-testid={`${TEST_ID}-remove-${index}`}
                    />
                  </RiTooltip>
                </FlexItem>
              )}
            </Row>
            {/* A connective sits between each pair of rows. Every one is bound
                to the single global `combinator`, so changing any switches all
                of them — Redis has no per-predicate operators. The first one
                carries the "applies to all" hint. */}
            {index < predicates.length - 1 && (
              <S.ConnectiveRow align="center" gap="s" grow={false}>
                <FlexItem grow={false}>
                  <ButtonGroup
                    aria-label={COMBINATOR_ARIA}
                    data-testid={`${TEST_ID}-combinator-${index}`}
                  >
                    <ButtonGroup.Button
                      isSelected={combinator === ArrayCombinator.And}
                      onClick={() => onChangeCombinator(ArrayCombinator.And)}
                      disabled={disabled}
                      data-testid={`${TEST_ID}-combinator-${index}-and`}
                    >
                      AND
                    </ButtonGroup.Button>
                    <ButtonGroup.Button
                      isSelected={combinator === ArrayCombinator.Or}
                      onClick={() => onChangeCombinator(ArrayCombinator.Or)}
                      disabled={disabled}
                      data-testid={`${TEST_ID}-combinator-${index}-or`}
                    >
                      OR
                    </ButtonGroup.Button>
                  </ButtonGroup>
                </FlexItem>
                {index === 0 && (
                  <FlexItem grow={false}>
                    <Text size="s" color="subdued">
                      {APPLIES_TO_ALL_LABEL}
                    </Text>
                  </FlexItem>
                )}
              </S.ConnectiveRow>
            )}
          </React.Fragment>
        ))}
      </Col>

      <Col gap="m" grow={false}>
        {/* Compact disclosure: chevron + "Options" on the left, the add-row
            "+" on the right, the option fields below once expanded. */}
        <Row align="center" gap="xs" grow={false}>
          <FlexItem grow={false}>
            <EmptyButton
              onClick={() => setOptionsOpen((open) => !open)}
              aria-expanded={optionsOpen}
              data-testid={`${TEST_ID}-options-toggle`}
            >
              <Row align="center" gap="s" grow={false}>
                <FlexItem grow={false}>
                  <RiIcon
                    size="m"
                    type={optionsOpen ? 'ChevronDownIcon' : 'ChevronRightIcon'}
                  />
                </FlexItem>
                <FlexItem grow={false}>
                  <Text size="s">{OPTIONS_LABEL}</Text>
                </FlexItem>
              </Row>
            </EmptyButton>
          </FlexItem>
          <FlexItem grow={false}>
            <InfoHint content={OPTIONS_HINT} />
          </FlexItem>
          <FlexItem grow />
          <FlexItem grow={false}>
            <RiTooltip content={ADD_PREDICATE_ARIA} position="left">
              <ActionIconButton
                variant="secondary"
                icon={PlusIcon}
                aria-label={ADD_PREDICATE_ARIA}
                onClick={onAddPredicate}
                disabled={disabled}
                data-testid={`${TEST_ID}-add-predicate`}
              />
            </RiTooltip>
          </FlexItem>
        </Row>

        {optionsOpen && (
          <Col gap="m" grow={false}>
            <Row align="center" gap="xl">
              <FlexItem grow={false}>
                <Row align="center" gap="s" grow={false}>
                  <FlexItem grow={false}>
                    <Row align="center" gap="xs" grow={false}>
                      <FlexItem grow={false}>
                        <Text size="s">{RANGE_LABEL}</Text>
                      </FlexItem>
                      <FlexItem grow={false}>
                        <InfoHint content={RANGE_HINT} />
                      </FlexItem>
                    </Row>
                  </FlexItem>
                  <FlexItem grow={false}>
                    <S.NarrowInputBox>
                      <TextInput
                        value={options.start}
                        onChange={(start) => onChangeOptions({ start })}
                        placeholder={START_PLACEHOLDER}
                        error={startInvalid ? INVALID_INDEX_MESSAGE : undefined}
                        disabled={disabled}
                        data-testid={`${TEST_ID}-start`}
                      />
                    </S.NarrowInputBox>
                  </FlexItem>
                  <FlexItem grow={false}>
                    <Text size="s">{RANGE_TO_LABEL}</Text>
                  </FlexItem>
                  <FlexItem grow={false}>
                    <S.NarrowInputBox>
                      <TextInput
                        value={options.end}
                        onChange={(end) => onChangeOptions({ end })}
                        placeholder={END_PLACEHOLDER}
                        error={endInvalid ? INVALID_INDEX_MESSAGE : undefined}
                        disabled={disabled}
                        data-testid={`${TEST_ID}-end`}
                      />
                    </S.NarrowInputBox>
                  </FlexItem>
                </Row>
              </FlexItem>
              <FlexItem grow={false}>
                <Row align="center" gap="s" grow={false}>
                  <FlexItem grow={false}>
                    <Row align="center" gap="xs" grow={false}>
                      <FlexItem grow={false}>
                        <S.InlineCheckbox
                          id={`${TEST_ID}-context-toggle`}
                          name="array-search-context-toggle"
                          label={CONTEXT_LABEL}
                          checked={context.enabled}
                          onChange={(e) =>
                            onChangeContext({ enabled: e.target.checked })
                          }
                          disabled={disabled}
                          data-testid={`${TEST_ID}-context-toggle`}
                        />
                      </FlexItem>
                      <FlexItem grow={false}>
                        <InfoHint content={CONTEXT_HINT} />
                      </FlexItem>
                    </Row>
                  </FlexItem>
                  <FlexItem grow={false}>
                    <Text size="s">{CONTEXT_PREFIX}</Text>
                  </FlexItem>
                  {/* Always rendered so ticking Context doesn't shift the row;
                      it just becomes editable once the toggle is on. */}
                  <FlexItem grow={false}>
                    <S.NarrowInputBox>
                      <NumericInput
                        autoValidate
                        min={CONTEXT_COUNT_MIN}
                        max={CONTEXT_COUNT_MAX}
                        value={context.count}
                        onChange={(next) =>
                          onChangeContext({
                            count: Number(next ?? CONTEXT_COUNT_MIN),
                          })
                        }
                        disabled={disabled || !context.enabled}
                        data-testid={`${TEST_ID}-context`}
                      />
                    </S.NarrowInputBox>
                  </FlexItem>
                </Row>
              </FlexItem>
              <FlexItem grow />
            </Row>

            <S.OptionsDivider grow={false} />

            <Row align="center" gap="xl">
              <FlexItem grow={false}>
                <Row align="center" gap="xs" grow={false}>
                  <FlexItem grow={false}>
                    <S.InlineCheckbox
                      id={`${TEST_ID}-nocase`}
                      name="array-search-nocase"
                      label={NOCASE_LABEL}
                      checked={options.nocase}
                      onChange={(e) =>
                        onChangeOptions({ nocase: e.target.checked })
                      }
                      disabled={disabled}
                      data-testid={`${TEST_ID}-nocase`}
                    />
                  </FlexItem>
                  <FlexItem grow={false}>
                    <InfoHint content={NOCASE_HINT} />
                  </FlexItem>
                </Row>
              </FlexItem>
              <FlexItem grow={false}>
                <Row align="center" gap="xs" grow={false}>
                  <FlexItem grow={false}>
                    <S.InlineCheckbox
                      id={`${TEST_ID}-withvalues`}
                      name="array-search-withvalues"
                      label={WITHVALUES_LABEL}
                      checked={options.withValues}
                      onChange={(e) =>
                        onChangeOptions({ withValues: e.target.checked })
                      }
                      disabled={disabled}
                      data-testid={`${TEST_ID}-withvalues`}
                    />
                  </FlexItem>
                  <FlexItem grow={false}>
                    <InfoHint content={WITHVALUES_HINT} />
                  </FlexItem>
                </Row>
              </FlexItem>
              <FlexItem grow={false}>
                <Row align="center" gap="xs" grow={false}>
                  <FlexItem grow={false}>
                    <S.InlineCheckbox
                      id={`${TEST_ID}-limit-toggle`}
                      name="array-search-limit-toggle"
                      label={LIMIT_LABEL}
                      checked={options.limitEnabled}
                      onChange={(e) =>
                        onChangeOptions({ limitEnabled: e.target.checked })
                      }
                      disabled={disabled}
                      data-testid={`${TEST_ID}-limit-toggle`}
                    />
                  </FlexItem>
                  <FlexItem grow={false}>
                    <InfoHint content={LIMIT_HINT} />
                  </FlexItem>
                </Row>
              </FlexItem>
              {/* Always rendered so ticking LIMIT doesn't shift the row; the
                  pre-filled default just becomes editable once enabled. */}
              <FlexItem grow={false}>
                <S.NarrowInputBox>
                  <TextInput
                    value={options.limit}
                    onChange={(limit) => onChangeOptions({ limit })}
                    placeholder={DEFAULT_LIMIT}
                    error={limitInvalid ? INVALID_LIMIT_MESSAGE : undefined}
                    disabled={disabled || !options.limitEnabled}
                    data-testid={`${TEST_ID}-limit`}
                  />
                </S.NarrowInputBox>
              </FlexItem>
            </Row>
          </Col>
        )}
      </Col>

      <S.ActionRow align="center" gap="m">
        <FlexItem grow={false}>
          <RiTooltip
            content={
              previewVisible
                ? PREVIEW_TOGGLE_HIDE_TOOLTIP
                : PREVIEW_TOGGLE_SHOW_TOOLTIP
            }
            position="top"
          >
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
                aria-label={RESET_ARIA_LABEL}
                data-testid={`${TEST_ID}-reset`}
              />
            </RiTooltip>
          </FlexItem>
        )}
        <FlexItem grow={false}>
          <PrimaryButton
            onClick={() => onRun()}
            disabled={runDisabled}
            data-testid={`${TEST_ID}-run`}
          >
            {RUN_BUTTON_LABEL}
          </PrimaryButton>
        </FlexItem>
      </S.ActionRow>
    </S.FormContainer>
  )
}
