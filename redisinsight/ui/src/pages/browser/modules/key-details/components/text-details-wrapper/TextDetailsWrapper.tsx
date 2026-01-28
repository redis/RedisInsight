import React, { ReactNode } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import * as S from './TextDetailsWrapper.styles'
import styles from './styles.module.scss'

const TextDetailsWrapper = ({
  onClose,
  children,
  testid,
}: {
  onClose: () => void
  children: ReactNode
  testid?: string
}) => {
  const getDataTestid = (suffix: string) =>
    testid ? `${testid}-${suffix}` : suffix

  return (
    <S.Container data-testid={getDataTestid('details')}>
      <RiTooltip
        content="Close"
        position="left"
        anchorClassName={styles.closeRightPanel}
      >
        <S.CloseBtn
          icon={CancelSlimIcon}
          aria-label="Close key"
          onClick={() => onClose()}
          data-testid={getDataTestid('close-key-btn')}
        />
      </RiTooltip>
      <Row centered>
        <S.TextWrapper>
          <div>{children}</div>
        </S.TextWrapper>
      </Row>
    </S.Container>
  )
}

export default TextDetailsWrapper
