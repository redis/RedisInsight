import React, { ReactNode } from 'react'
import { Title } from 'uiSrc/components/base/text'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { BaseCardContainer } from './BaseCard.styles'

export type BaseCardProps = {
  title: string
  children: ReactNode
  titleActions?: ReactNode
  isSelected: boolean
} & React.HTMLAttributes<HTMLDivElement>

const BaseCard = ({
  title,
  children,
  titleActions,
  isSelected,
  ...restProps
}: BaseCardProps) => (
  <BaseCardContainer {...restProps} role="button" isSelected={isSelected}>
    <Col gap="s">
      <Row align="center" justify="between">
        <Title size="S" color="primary">
          {title}
        </Title>

        {titleActions && <FlexItem>{titleActions}</FlexItem>}
      </Row>

      {children}
    </Col>
  </BaseCardContainer>
)

export default BaseCard
