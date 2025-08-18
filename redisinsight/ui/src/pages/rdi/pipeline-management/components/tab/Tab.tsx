import React from 'react'
import cx from 'classnames'
import { RiText } from 'uiBase/text'
import { RiLoader, RiTooltip } from 'uiBase/display'
import ValidationErrorsList from 'uiSrc/pages/rdi/pipeline-management/components/validation-errors-list/ValidationErrorsList'

import { RiIcon } from 'uiBase/icons'
import styles from './styles.module.scss'

export interface IProps {
  title: string | JSX.Element
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
    children,
    fileName,
    testID,
    className,
    isLoading = false,
    isValid = true,
    validationErrors = [],
  } = props

  return (
    <div
      className={cx(styles.wrapper, className, { [styles.active]: isSelected })}
      data-testid={testID}
    >
      <RiText className="rdi-pipeline-nav__title" size="m">
        {title}
      </RiText>
      {fileName ? (
        <div className="rdi-pipeline-nav__file">
          <RiIcon type="ContractsIcon" className="rdi-pipeline-nav__fileIcon" />
          <RiText
            className={cx('rdi-pipeline-nav__text', { invalid: !isValid })}
          >
            {fileName}
          </RiText>

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
            <RiLoader
              data-testid="rdi-nav-config-loader"
              className={styles.loader}
            />
          )}
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

export default Tab
