import React, { ReactNode } from 'react'
import { Title } from 'uiSrc/components/base/text'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { NavigationTabContainer } from './styles'

export interface IProps extends React.HTMLAttributes<HTMLDivElement>{
  title: string
  children: ReactNode,
  titleActions?: ReactNode,
  isSelected: boolean
  isLoading?: boolean
}

const NavigationTab = (props: IProps) => {
  const {
    title,
    titleActions,
    isSelected,
    children,
    isLoading = false,
    ...restProps
  } = props

  return (
    <NavigationTabContainer
      {...restProps}
      role="button"
      isSelected={isSelected}
    >
      <Col gap="s">
        <Row align="center" justify="between">
          <Title size="S" color="primary">
            {title}
          </Title>
          {titleActions && <FlexItem>{titleActions}</FlexItem>}
        </Row>
        {children}
      </Col>
    </NavigationTabContainer>
  )
}

export default NavigationTab
