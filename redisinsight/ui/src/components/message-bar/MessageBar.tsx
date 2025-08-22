import React, { useEffect, useState } from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import styles from './styles.module.scss'
import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

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
        <FlexItem grow className={styles.text}>
          {children}
        </FlexItem>
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

const Container = styled(Row)`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  border-radius: 20px;
  padding: 0 25px 0 35px;
  max-width: 80%;
  min-height: 48px;
  box-shadow: ${({ theme }: { theme: Theme }) => theme.core.shadow.shadow700};
`

const ContainerWrapper = styled(Row)`
  position: absolute;
  min-width: 332px;
  min-height: 48px;
  bottom: 12px;
  width: 100%;
  z-index: 10;
`

export default MessageBar
