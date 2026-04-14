import styled, { css } from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export const Container = styled(Col)`
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral400};
  min-height: 45px;
  flex-grow: 0;
  flex-shrink: 0;
`

const HEADER_HEIGHT = '45px'

export const Header = styled(Row)`
  height: ${HEADER_HEIGHT};
  max-height: ${HEADER_HEIGHT};
  min-height: ${HEADER_HEIGHT};
  padding: ${({ theme }) => `0 ${theme.core.space.space200}`};
  cursor: pointer;
  user-select: none;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral200};

  &:hover {
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral300};
  }
`

export const HeaderInfo = styled(Row)`
  min-width: 0;
  flex: 1;
  overflow: hidden;
`

const truncatedText = css`
  display: flex;
  align-items: center;

  span {
    display: inline-block;
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`

export const CopyButtonWrapper = styled.span`
  padding-left: ${({ theme }) => theme.core.space.space025};
  opacity: 0;
  flex-shrink: 0;
  transition: opacity 250ms ease-in-out;
`

export const Name = styled(Text)`
  flex-shrink: 0;
  max-width: 80%;
  ${truncatedText}

  &:hover {
    ${CopyButtonWrapper} {
      opacity: 1;
    }
  }
`

export const Description = styled(Text)`
  min-width: 0;
  flex-shrink: 1;
  ${truncatedText}
`

export const BadgeWrapper = styled.span`
  flex-shrink: 0;
`

export const Body = styled(Col)`
  max-height: 400px;
  min-height: 200px;
  overflow: auto;
  border-top: 1px solid ${({ theme }) => theme.semantic.color.border.neutral400};
`

export const ChevronWrapper = styled(Row)`
  padding-left: ${({ theme }) => theme.core.space.space100};
  border-left: 2px solid
    ${({ theme }) => theme.semantic.color.border.neutral400};
`
