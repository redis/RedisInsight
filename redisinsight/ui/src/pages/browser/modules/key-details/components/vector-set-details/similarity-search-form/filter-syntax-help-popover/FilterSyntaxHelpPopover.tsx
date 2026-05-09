import React, { useState } from 'react'

import {
  IconButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { RiPopover } from 'uiSrc/components/base/popover'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'

import { FILTER_EXAMPLES, FILTER_OPERATORS } from './constants'
import * as S from './FilterSyntaxHelpPopover.styles'

const TEST_ID = 'similarity-search-filter-help'

export const FilterSyntaxHelpPopover = () => {
  const [isOpen, setIsOpen] = useState(false)

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
          aria-label="Filter syntax help"
          onClick={() => setIsOpen((prev) => !prev)}
          data-testid={`${TEST_ID}-trigger`}
        />
      }
    >
      <S.HelpPopoverContainer data-testid={`${TEST_ID}-panel`} gap="s">
        <Title size="XS">Filter syntax</Title>
        <Text size="s">
          Filters use a small expression language evaluated against each
          element&apos;s attributes.
        </Text>
        <Text size="s" color="secondary">
          Operators
        </Text>
        <S.HelpExampleList>
          {FILTER_OPERATORS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </S.HelpExampleList>
        <Text size="s" color="secondary">
          Examples
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
            Close
          </SecondaryButton>
        </Row>
      </S.HelpPopoverContainer>
    </RiPopover>
  )
}
