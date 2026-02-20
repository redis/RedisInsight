import styled from 'styled-components'

export const BreadcrumbLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;

  &:hover {
    text-decoration: underline;
  }
`

export const SlashSeparator = styled.span`
  color: ${({ theme }) => theme.semantic.color.text.neutral500};
  font-size: ${({ theme }) => theme.core.font.fontSize200};
  font-weight: 400;
  line-height: 1;
`

export const IndexSelectTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space050};
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.semantic.color.text.primary500};
  font-weight: 700;

  &:hover {
    text-decoration: underline;
  }
`
