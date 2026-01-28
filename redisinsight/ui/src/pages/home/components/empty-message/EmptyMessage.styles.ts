import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { RiImage } from 'uiSrc/components/base/display'

export const Container = styled(Col)`
  align-items: center;
  justify-content: center;
  height: calc(100vh - 185px);

  & > * {
    margin-bottom: ${({ theme }) => theme.core.space.space200};
  }
`

export const MessageText = styled(Text)`
  font-size: 18px;
  font-weight: 500;
`

export const Icon = styled(RiImage)`
  width: 120px;
`
