import React from 'react'
import { Text, Title } from 'uiSrc/components/base/text'
import { Loader } from 'uiSrc/components/base/display'

import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'
import ValidationErrorsList from 'uiSrc/pages/rdi/pipeline-management/components/validation-errors-list/ValidationErrorsList'
import styles from './styles.module.scss'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { StyledTabContainer } from './styles'
import NavigationTab from 'uiSrc/pages/rdi/pipeline-management/components/navigation/navigation-tab'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import cx from 'classnames'
import Tab from 'uiSrc/pages/rdi/pipeline-management/components/tab'

export interface IProps {
  onSelectedTabChanged: (id: string) => void
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

const ConfigNavigationTab = (props: IProps) => {
  const {
    onSelectedTabChanged,
    isSelected,
    isLoading = false,
    isValid = true,
    validationErrors = [],
  } = props


  return (
    <NavigationTab
      title="Configuration"
      isSelected={isSelected}
      tabIndex={0}
      onKeyDown={() => {}}
      onClick={() => onSelectedTabChanged(RdiPipelineTabs.Config)}
      data-testid={`rdi-nav-btn-${RdiPipelineTabs.Config}`}
    >
      Configuration file
    </NavigationTab>
  )
}

export default ConfigNavigationTab
