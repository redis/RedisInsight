import React from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { NumericInput } from 'uiSrc/components/base/inputs'
import { Text } from 'uiSrc/components/base/text'

import { InfoHint } from '../../components/InfoHint'
import { CONTEXT_COUNT_MAX, CONTEXT_COUNT_MIN } from '../../constants'
import {
  ARRAY_CONTEXT_CONTROL_TEST_ID as TEST_ID,
  CONTEXT_HINT,
  CONTEXT_LABEL,
  CONTEXT_PREFIX,
} from './ContextControl.constants'
import { ContextControlProps } from './ContextControl.types'
import * as S from './ContextControl.styles'

/**
 * Search-tab Context control: a display-only toggle + ±N neighbour count that
 * governs how a matched row expands. Rendered as a subheader strip directly
 * above the results table (not inside the search form) since it never enters
 * the ARGREP command.
 */
export const ContextControl = ({
  context,
  onChange,
  disabled = false,
}: ContextControlProps) => (
  <S.SubheaderContainer grow={false} data-testid={TEST_ID}>
    <Row align="center" gap="s" grow={false}>
      <FlexItem grow={false}>
        <Row align="center" gap="xs" grow={false}>
          <FlexItem grow={false}>
            <S.InlineCheckbox
              id={`${TEST_ID}-toggle`}
              name="array-search-context-toggle"
              label={CONTEXT_LABEL}
              checked={context.enabled}
              onChange={(e) => onChange({ enabled: e.target.checked })}
              disabled={disabled}
              data-testid={`${TEST_ID}-toggle`}
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
      {/* Always rendered so ticking Context doesn't shift the row; it just
          becomes editable once the toggle is on. */}
      <FlexItem grow={false}>
        <S.NarrowInputBox>
          <NumericInput
            autoValidate
            min={CONTEXT_COUNT_MIN}
            max={CONTEXT_COUNT_MAX}
            value={context.count}
            onChange={(next) =>
              onChange({
                count: Math.round(Number(next ?? CONTEXT_COUNT_MIN)),
              })
            }
            disabled={disabled || !context.enabled}
            data-testid={`${TEST_ID}-count`}
          />
        </S.NarrowInputBox>
      </FlexItem>
    </Row>
  </S.SubheaderContainer>
)
