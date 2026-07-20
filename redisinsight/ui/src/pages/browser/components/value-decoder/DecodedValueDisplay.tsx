import React, { useMemo } from 'react'

import { Text } from 'uiSrc/components/base/text'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import FormattedValue from 'uiSrc/pages/browser/modules/key-details/shared/formatted-value/FormattedValue'

import * as S from './DecodedValueDisplay.styles'
import { useValueDecoder } from './ValueDecoderProvider'
import {
  formatParsedFields,
  formatParsedFieldsInline,
  parseBufferWithRule,
} from './utils'

export interface DecodedValueDisplayProps {
  buffer: RedisResponseBuffer
  fallback: React.ReactNode
  expanded?: boolean
}

export const DecodedValueDisplay = ({
  buffer,
  fallback,
  expanded,
}: DecodedValueDisplayProps) => {
  const { matchedRule, isDecodeEnabled } = useValueDecoder()

  const decodedNodes = useMemo(() => {
    if (!isDecodeEnabled || !matchedRule) return null
    return parseBufferWithRule(buffer, matchedRule.schema)
  }, [buffer, isDecodeEnabled, matchedRule])

  const formattedInline = useMemo(
    () => (decodedNodes ? formatParsedFieldsInline(decodedNodes) : ''),
    [decodedNodes],
  )

  const formattedMultiline = useMemo(
    () => (decodedNodes ? formatParsedFields(decodedNodes) : ''),
    [decodedNodes],
  )

  if (!decodedNodes) {
    return <>{fallback}</>
  }

  if (decodedNodes.length === 0) {
    return (
      <Text color="secondary" component="span">
        No decoded fields
      </Text>
    )
  }

  if (expanded) {
    return (
      <Text
        color="secondary"
        component="div"
        style={{ maxWidth: '100%', whiteSpace: 'break-spaces' }}
      >
        {formattedMultiline}
      </Text>
    )
  }

  return (
    <FormattedValue
      value={formattedInline}
      tooltipContent={
        <S.DecodedValueTooltipContent>
          {formattedMultiline}
        </S.DecodedValueTooltipContent>
      }
      maxWidth="min(90vw, max-content)"
      title="Value"
    />
  )
}
