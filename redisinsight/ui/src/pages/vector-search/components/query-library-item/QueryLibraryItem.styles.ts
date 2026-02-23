import styled, { css } from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export const Container = styled(Col)`
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  overflow: auto;
  height: 100%;
`

const HEADER_HEIGHT = '45px'

export const Header = styled(Row)<{ $isOpen?: boolean }>`
  height: ${HEADER_HEIGHT};
  max-height: ${HEADER_HEIGHT};
  min-height: ${HEADER_HEIGHT};
  padding: ${({ theme }) => `0 ${theme.core.space.space200}`};
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral200};
  }

  &:not(:last-child) {
    border-bottom: 1px solid
      ${({ theme }) => theme.semantic.color.border.neutral500};
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

export const Name = styled(Text)`
  flex-shrink: 0;
  max-width: 80%;
  ${truncatedText}
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
  max-height: calc(100% - ${HEADER_HEIGHT});
  height: 200px;
  overflow: auto;
`

export const ChevronWrapper = styled(Row)<{ $isOpen?: boolean }>`
  padding-left: ${({ theme }) => theme.core.space.space100};
  transition: transform 0.5s ease;
  border-left: 2px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`
