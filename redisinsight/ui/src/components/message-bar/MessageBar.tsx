import React, { useEffect, useState } from 'react'

import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import styles from './styles.module.scss'
import { Container, ContainerWrapper } from './MessageBar.styles'

export interface Props {
  children?: React.ReactElement
  opened: boolean
}

const MessageBar = ({ children, opened }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    setIsOpen(opened)
  }, [opened])

  if (!isOpen) {
    return null
  }
  return (
    <ContainerWrapper centered>
      <Container grow={false} centered gap="l">
        <FlexItem grow>{children}</FlexItem>
        <FlexItem className={styles.cross}>
          <IconButton
            icon={CancelSlimIcon}
            aria-label="Close"
            onClick={() => setIsOpen(false)}
            data-testid="close-button"
          />
        </FlexItem>
      </Container>
    </ContainerWrapper>
  )
}

export default MessageBar
