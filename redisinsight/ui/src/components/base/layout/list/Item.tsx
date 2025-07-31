import React, { ButtonHTMLAttributes, ReactElement } from 'react'
import cx from 'classnames'

import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { useInnerText } from 'uiSrc/components/base/utils/hooks/inner-text'
import {
  ListClassNames,
  ListGroupItemProps,
  StyledItem,
  StyledItemInnerButton,
  StyledItemInnerSpan,
  StyledLabel,
} from './list.styles'

const Item = ({
  size,
  label,
  isActive,
  isDisabled,
  className,
  children,
  onClick,
  iconType,
  iconProps,
  icon,
  wrapText,
  buttonRef,
  color,
  ...rest
}: ListGroupItemProps) => {
  const isClickable = !!onClick
  let iconNode: ReactElement

  if (iconType) {
    // todo replace with redis-ui icon
    iconNode = (
      <RiIcon
        color="currentColor" // forces the icon to inherit its parent color
        {...iconProps}
        type={iconType}
        className={cx('euiListGroupItem__icon', iconProps?.className)}
      />
    )

    if (icon) {
      console.warn(
        'Both `iconType` and `icon` were passed to EuiListGroupItem but only one can exist. The `iconType` was used.',
      )
    }
  } else if (icon) {
    iconNode = icon
  } else {
    iconNode = <></>
  }
  // Only add the label as the title attribute if it's possibly truncated
  // Also ensure the value of the title attribute is a string
  const [ref, innerText] = useInnerText()
  const labelContent = !wrapText ? (
    <StyledLabel
      ref={ref}
      className="label"
      title={typeof label === 'string' ? label : innerText}
      wrapText={wrapText}
    >
      {label}
    </StyledLabel>
  ) : (
    <StyledLabel className="label" wrapText={wrapText}>
      {label}
    </StyledLabel>
  )
  let itemContent: ReactElement
  if (isDisabled || onClick) {
    itemContent = (
      <StyledItemInnerButton
        type="button"
        className={ListClassNames.listItemButton}
        disabled={isDisabled}
        onClick={onClick}
        $isActive={isActive}
        $isDisabled={isDisabled}
        $isClickable={isClickable}
        $size={size}
        ref={buttonRef}
        $color={color}
        {...(rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>)}
      >
        {iconNode !== undefined && iconNode}
        {labelContent}
      </StyledItemInnerButton>
    )
  } else {
    itemContent = (
      <StyledItemInnerSpan
        $isClickable={false}
        $isActive={isActive}
        $isDisabled={isDisabled}
        className={ListClassNames.listItemText}
        $color={color}
        $size={size}
        {...rest}
      >
        {iconNode !== undefined && iconNode}
        {labelContent}
      </StyledItemInnerSpan>
    )
  }

  return (
    <StyledItem
      $size={size}
      $isActive={isActive}
      $isDisabled={isDisabled}
      $color={color}
      className={cx(ListClassNames.listItem, className, {
        [ListClassNames.listItemActive]: isActive,
        [ListClassNames.listItemDisabled]: isDisabled,
      })}
    >
      {itemContent}
    </StyledItem>
  )
}

export default Item
