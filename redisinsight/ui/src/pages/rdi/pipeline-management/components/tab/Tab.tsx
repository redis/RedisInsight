import React from 'react'
import { Text, Title } from 'uiSrc/components/base/text'
import { Loader } from 'uiSrc/components/base/display'

import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'
import ValidationErrorsList from 'uiSrc/pages/rdi/pipeline-management/components/validation-errors-list/ValidationErrorsList'
import styles from './styles.module.scss'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { StyledTabContainer } from './styles'

export interface IProps {
  title: JSX.Element | string
  titleActions?: JSX.Element
  isSelected: boolean
  className?: string
  fileName?: string
  children?: React.ReactElement | string
  testID?: string
  isLoading?: boolean
  isValid?: boolean
  validationErrors?: string[]
}

const Tab = (props: IProps) => {
  const {
    title,
    isSelected,
    titleActions,
    children,
    fileName,
    testID,
    isLoading = false,
    isValid = true,
    validationErrors = [],
  } = props

  return (
    <StyledTabContainer
      data-testid={testID}
      isSelected={isSelected}
      role="button"
    >
      <Row align="center" justify="between">
        <Title size="S" color="primary">
          {title}
        </Title>
        {titleActions && <FlexItem>{titleActions}</FlexItem>}
      </Row>
      {fileName ? (
        <div className="rdi-pipeline-nav__file">
          <Text color="primary">{fileName}</Text>

          {!isValid && (
            <RiTooltip
              position="right"
              content={
                <ValidationErrorsList validationErrors={validationErrors} />
              }
            >
              <RiIcon
                type="InfoIcon"
                className="rdi-pipeline-nav__error"
                data-testid="rdi-nav-config-error"
                color="danger500"
              />
            </RiTooltip>
          )}

          {isLoading && (
            <Loader
              data-testid="rdi-nav-config-loader"
              className={styles.loader}
            />
          )}
          {children}
        </div>
      ) : (
        children
      )}
    </StyledTabContainer>
  )
}

export default Tab
