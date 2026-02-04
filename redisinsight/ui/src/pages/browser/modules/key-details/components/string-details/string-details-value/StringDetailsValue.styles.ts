import styled from 'styled-components'
import { Text } from 'uiSrc/components/base/text'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'

const OUTER_HEIGHT = '220px'
const OUTER_HEIGHT_MOBILE = '340px'

export const Container = styled.div`
  padding: ${({ theme }) =>
    `${theme.core.space.space250} ${theme.core.space.space200} ${theme.core.space.space250}`};
  max-height: calc(100vh - ${OUTER_HEIGHT});
  overflow: hidden;
  color: ${({ theme }) => theme.semantic.color.text.neutral600};
  flex: 1;
  position: relative;

  @media only screen and (max-width: 767px) {
    max-height: calc(100vh - ${OUTER_HEIGHT_MOBILE});
  }

  > div {
    line-height: 1.19;
    max-height: 100%;
  }
`

export const StringValue = styled(Text)`
  overflow-y: auto;
  overflow-x: hidden;
  word-break: break-word;
  line-height: 1.2;
  width: 100%;

  pre {
    background-color: transparent;
    padding: 0;
  }
`

export const TooltipAnchor = styled.div`
  display: inline-flex;
  height: auto;
  max-height: 100%;
  width: 100%;
`

export const StringFooterBtn = styled(SecondaryButton)`
  color: ${({ theme }) => theme.semantic.color.text.neutral600};
  font-size: ${({ theme }) => theme.core.font.fontSize.s13};
  height: auto;
  padding: ${({ theme }) =>
    `${theme.core.space.space50} ${theme.core.space.space100}`};

  span {
    font-weight: ${({ theme }) => theme.core.font.fontWeight.normal};
  }
`
