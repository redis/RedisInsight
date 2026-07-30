import React, { useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import {
  IconButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { RiPopover } from 'uiSrc/components/base/popover'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { useTranslation } from 'uiSrc/i18n'

import { FILTER_EXAMPLES, getFilterOperators } from './constants'
import * as S from './FilterSyntaxHelpPopover.styles'

const TEST_ID = 'similarity-search-filter-help'

export const FilterSyntaxHelpPopover = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { id: databaseId } = useAppSelector(connectedInstanceSelector)
  const filterOperators = getFilterOperators(t)

  const handleTriggerClick = () => {
    setIsOpen((prev) => {
      if (!prev) {
        sendEventTelemetry({
          event: TelemetryEvent.VECTOR_SET_ATTRIBUTE_FILTER_SYNTAX_VIEWED,
          eventData: { databaseId },
        })
      }
      return !prev
    })
  }

  return (
    <RiPopover
      ownFocus
      anchorPosition="upCenter"
      isOpen={isOpen}
      closePopover={() => setIsOpen(false)}
      panelPaddingSize="m"
      trigger={
        <IconButton
          icon={InfoIcon}
          aria-label={t('browser.vectorSet.filterHelp.aria')}
          onClick={handleTriggerClick}
          data-testid={`${TEST_ID}-trigger`}
        />
      }
    >
      <S.HelpPopoverContainer data-testid={`${TEST_ID}-panel`} gap="s">
        <Title size="XS">{t('browser.vectorSet.filterHelp.title')}</Title>
        <Text size="s">{t('browser.vectorSet.filterHelp.intro')}</Text>
        <Text size="s" color="secondary">
          {t('browser.vectorSet.filterHelp.operatorsLabel')}
        </Text>
        <S.HelpExampleList>
          {filterOperators.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </S.HelpExampleList>
        <Text size="s" color="secondary">
          {t('browser.vectorSet.filterHelp.examplesLabel')}
        </Text>
        <S.HelpExampleList>
          {FILTER_EXAMPLES.map((line) => (
            <li key={line}>
              <S.StyledExampleText size="s">{line}</S.StyledExampleText>
            </li>
          ))}
        </S.HelpExampleList>
        <Row justify="end">
          <SecondaryButton
            size="s"
            onClick={() => setIsOpen(false)}
            data-testid={`${TEST_ID}-close`}
          >
            {t('browser.vectorSet.filterHelp.close')}
          </SecondaryButton>
        </Row>
      </S.HelpPopoverContainer>
    </RiPopover>
  )
}
