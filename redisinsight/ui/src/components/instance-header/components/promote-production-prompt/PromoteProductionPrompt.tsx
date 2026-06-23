import React from 'react'

import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'

import { usePromoteProductionPrompt } from './hooks/usePromoteProductionPrompt'
import {
  PROMOTE_PRODUCTION_PROMPT,
  PROMPT_WIDTH,
} from './PromoteProductionPrompt.constants'
import * as S from './PromoteProductionPrompt.styles'

// One-time CTA (fixed, bottom-right) nudging the user to classify a
// likely-production database. Decision/state logic lives in the hook.
export const PromoteProductionPrompt = () => {
  const { isOpen, onDismiss, onMarkProduction } = usePromoteProductionPrompt()

  if (!isOpen) {
    return null
  }

  return (
    <S.Container width={PROMPT_WIDTH} data-testid="promote-production-prompt">
      <Text size="m">
        <strong>{PROMOTE_PRODUCTION_PROMPT.title}</strong>
      </Text>
      <Text size="s" color="secondary">
        {PROMOTE_PRODUCTION_PROMPT.body}
      </Text>
      <Row gap="m" justify="end">
        <SecondaryButton
          size="s"
          onClick={onDismiss}
          data-testid="promote-production-not-now"
        >
          {PROMOTE_PRODUCTION_PROMPT.dismissLabel}
        </SecondaryButton>
        <PrimaryButton
          size="s"
          onClick={onMarkProduction}
          data-testid="promote-production-confirm"
        >
          {PROMOTE_PRODUCTION_PROMPT.confirmLabel}
        </PrimaryButton>
      </Row>
    </S.Container>
  )
}
