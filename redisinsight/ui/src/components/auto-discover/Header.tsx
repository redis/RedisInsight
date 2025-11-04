import React, { ReactNode } from 'react'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { ArrowLeftIcon } from 'uiSrc/components/base/icons'
import {
  PageSubTitle,
  PageTitle,
  SearchContainer,
  SearchForm,
} from 'uiSrc/components/auto-discover/index'
import { SearchInput } from 'uiSrc/components/base/inputs'

type HeaderProps = {
  title: ReactNode
  subTitle?: ReactNode
  onBack: () => void
  onQueryChange: (query: string) => void
  backButtonText?: string
}
export const Header = ({
  title,
  subTitle,
  onBack,
  onQueryChange,
  backButtonText = 'Add databases',
}: HeaderProps) => {
  return (
    <Row align="center" justify="between" grow={false}>
      <Col align="start" justify="start" gap="m">
        <EmptyButton
          icon={ArrowLeftIcon}
          onClick={onBack}
          data-testid="btn-back-adding"
        >
          {backButtonText}
        </EmptyButton>
        <PageTitle data-testid="title">{title}</PageTitle>
        {subTitle && (
          <FlexItem grow>
            <PageSubTitle>{subTitle}</PageSubTitle>
          </FlexItem>
        )}
      </Col>
      <Row justify="end" gap="s" grow={false}>
        <SearchContainer>
          <SearchForm>
            <SearchInput
              placeholder="Search..."
              onChange={onQueryChange}
              aria-label="Search"
              data-testid="search"
            />
          </SearchForm>
        </SearchContainer>
      </Row>
    </Row>
  )
}
