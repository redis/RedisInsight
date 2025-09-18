import React from 'react'
import { RiPopover, RiPopoverProps } from 'uiSrc/components'
import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text, Title } from 'uiSrc/components/base/text'

const PopoverContentWrapper = styled(Col)`
  word-break: break-all;
  max-width: 300px;
`

export interface ConfirmationPopoverProps
  extends Omit<RiPopoverProps, 'children' | 'title'> {
  title?: JSX.Element | string
  message?: JSX.Element | string
  appendInfo?: JSX.Element | string | null
  confirmButton: React.ReactNode
}

const ConfirmationPopover = (props: ConfirmationPopoverProps) => {
  const { title, message, confirmButton, appendInfo, ...rest } = props

  return (
    <RiPopover {...rest}>
      <PopoverContentWrapper gap="l" data-testid="confirm-popover">
        {title && <Title size="S">{title}</Title>}
        {message && <Text size="m">{message}</Text>}
        {appendInfo}
        <Row>{confirmButton}</Row>
      </PopoverContentWrapper>
    </RiPopover>
  )
}

export default ConfirmationPopover
