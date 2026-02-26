import React from 'react'
import { TextButton } from '@redis-ui/components'
import { ButtonIcon } from 'uiSrc/components/base/forms/buttons/Button'
import { Row } from 'uiSrc/components/base/layout/flex'

import { EmptyButtonProps } from './EmptyButton.types'

export const EmptyButton = React.forwardRef<
  HTMLButtonElement,
  EmptyButtonProps
>(
  (
    {
      children,
      icon,
      iconSide = 'left',
      loading,
      size = 'small',
      justify = 'center',
      ...rest
    },
    ref,
  ) => (
    <TextButton ref={ref} {...rest}>
      {icon ? (
        <Row justify={justify} gap="m" align="center">
          <ButtonIcon
            buttonSide="left"
            icon={icon}
            iconSide={iconSide}
            loading={loading}
            size={size}
          />
          {children}
          <ButtonIcon
            buttonSide="right"
            icon={icon}
            iconSide={iconSide}
            loading={loading}
            size={size}
          />
        </Row>
      ) : (
        children
      )}
    </TextButton>
  ),
)

EmptyButton.displayName = 'EmptyButton'
