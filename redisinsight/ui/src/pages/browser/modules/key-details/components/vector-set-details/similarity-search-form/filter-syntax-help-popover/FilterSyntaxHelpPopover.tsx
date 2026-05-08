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

import {
  HelpExampleList,
  HelpPopoverContainer,
} from './FilterSyntaxHelpPopover.styles'
import { FILTER_EXAMPLES, FILTER_OPERATORS } from './constants'
import { FilterSyntaxHelpPopoverProps } from './FilterSyntaxHelpPopover.types'

export const FilterSyntaxHelpPopover = ({
  'data-testid': dataTestId = 'similarity-search-filter-help',
}: FilterSyntaxHelpPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <RiPopover
      ownFocus
      anchorPosition="upCenter"
      isOpen={isOpen}
      closePopover={() => setIsOpen(false)}
      panelPaddingSize="m"
      button={
        <IconButton
          icon={InfoIcon}
          aria-label="Filter syntax help"
          onClick={() => setIsOpen((prev) => !prev)}
          data-testid={`${dataTestId}-trigger`}
        />
      }
    >
      <HelpPopoverContainer data-testid={`${dataTestId}-panel`}>
        <Title size="XS">Filter syntax</Title>
        <Text size="s">
          Filters use a small expression language evaluated against each
          element&apos;s attributes.
        </Text>
        <Text size="s" color="secondary">
          Operators
        </Text>
        <HelpExampleList>
          {FILTER_OPERATORS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </HelpExampleList>
        <Text size="s" color="secondary">
          Examples
        </Text>
        <HelpExampleList>
          {FILTER_EXAMPLES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </HelpExampleList>
        <Row justify="end">
          <SecondaryButton
            size="s"
            onClick={() => setIsOpen(false)}
            data-testid={`${dataTestId}-close`}
          >
            Close
          </SecondaryButton>
        </Row>
      </HelpPopoverContainer>
    </RiPopover>
  )
}
