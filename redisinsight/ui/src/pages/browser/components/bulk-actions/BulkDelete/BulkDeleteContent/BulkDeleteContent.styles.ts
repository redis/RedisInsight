import styled from 'styled-components'
import { Text } from 'uiSrc/components/base/text'

export const Container = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  padding-bottom: 40px;
  min-height: 200px;
  width: 100%;
  position: relative;
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 ${({ theme }) => theme.core.space.space150} 10px;
  height: 40px;
`

export const HeaderTitle = styled(Text)`
  padding-bottom: 6px;
  font-size: 14px;
  line-height: 24px;
`

export const HeaderSummary = styled(Text)`
  font-size: 13px;
  line-height: 18px;
  padding-top: 6px;
  color: ${({ theme }) => theme.semantic.color.text.tertiary};
`

export const List = styled.div`
  display: flex;
  flex-grow: 1;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.default};
  padding-top: ${({ theme }) => theme.core.space.space050};
  padding-left: ${({ theme }) => theme.core.space.space150};
  position: relative;
`

export const Item = styled.div`
  width: 100%;
  word-break: break-all;
`

export const Key = styled.span`
  display: inline;
  padding-right: ${({ theme }) => theme.core.space.space150};
  color: ${({ theme }) => theme.semantic.color.text.secondary};
`

export const Error = styled.span`
  display: inline;
  color: ${({ theme }) => theme.semantic.color.text.danger};
  word-break: break-word;
`
