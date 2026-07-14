import React from 'react'
import styled from 'styled-components'

import { RiTooltip } from 'uiSrc/components'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'

import { EyeIcon, EyeOffIcon } from './EyeIcon'
import { useValueDecoder } from './ValueDecoderProvider'
import { VALUE_DECODER_TEST_ID } from './constants'

const ToggleButton = styled(EmptyButton)<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  min-height: 24px;
  padding: 0;
  color: ${({ theme, $active }) =>
    $active
      ? theme.components.typography.colors.primary
      : theme.components.typography.colors.secondary};
`

export interface ValueDecoderHeaderLabelProps {
  label?: string
}

export const ValueDecoderHeaderLabel = ({
  label = 'Value',
}: ValueDecoderHeaderLabelProps) => {
  const { hasMatchingRule, isDecodeEnabled, toggleDecodeEnabled } =
    useValueDecoder()

  if (!hasMatchingRule) {
    return <>{label}</>
  }

  return (
    <Row gap="xs" align="center">
      <Text size="m" variant="semiBold" component="span">
        {label}
      </Text>
      <RiTooltip
        content={
          isDecodeEnabled
            ? 'Show raw value'
            : 'Decode value using configured binary layout'
        }
        position="top"
      >
        <ToggleButton
          aria-label={isDecodeEnabled ? 'Show raw value' : 'Show decoded value'}
          aria-pressed={isDecodeEnabled}
          $active={isDecodeEnabled}
          onClick={toggleDecodeEnabled}
          data-testid={`${VALUE_DECODER_TEST_ID}-toggle`}
        >
          {isDecodeEnabled ? <EyeIcon /> : <EyeOffIcon />}
        </ToggleButton>
      </RiTooltip>
    </Row>
  )
}
