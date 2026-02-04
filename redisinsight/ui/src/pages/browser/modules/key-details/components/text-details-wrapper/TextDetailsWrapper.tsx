import React, { ReactNode } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import * as S from './TextDetailsWrapper.styles'

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
      <S.CloseRightPanel>
        <RiTooltip content="Close" position="left">
          <S.CloseBtn
            icon={CancelSlimIcon}
            aria-label="Close key"
            onClick={() => onClose()}
            data-testid={getDataTestid('close-key-btn')}
          />
        </RiTooltip>
      </S.CloseRightPanel>
      <Row centered>
        <S.TextWrapper>
          <div>{children}</div>
        </S.TextWrapper>
      </Row>
    </S.Container>
  )
}

export default TextDetailsWrapper
