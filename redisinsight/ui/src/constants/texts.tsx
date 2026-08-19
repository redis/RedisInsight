import React from 'react'
import { Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Trans } from 'uiSrc/i18n'

export const NoResultsFoundText = (
  <Text size="m" data-testid="no-result-found-only">
    <Trans i18nKey="common.noResultsFound" />
  </Text>
)

export const lastDeliveredIDTooltipText = (
  <>
    <Text size="s">
      <Trans i18nKey="browser.stream.group.idTooltip" />
    </Text>
    <Spacer size="xs" />
    <Text size="s">
      <Trans
        i18nKey="browser.stream.group.idTooltipHint"
        components={{ bold: <b /> }}
      />
    </Text>
  </>
)

export const streamIDTooltipText = (
  <>
    <Trans i18nKey="browser.stream.entryFields.idTooltip" />
    <Spacer size="xs" />
    <Trans i18nKey="browser.stream.entryFields.idTooltipHint" />
  </>
)
