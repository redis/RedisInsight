import styled, { css } from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled.div<{
  $fullScreen?: boolean
  $modal?: boolean
}>`
  padding: 41px 30px;

  ${({ $fullScreen }) =>
    $fullScreen &&
    css`
      padding: 89px 77px;
    `}

  ${({ $modal }) =>
    $modal &&
    css`
      padding: 30px;
    `}
`

export const ContentWrapper = styled.div<{ $fullScreen?: boolean }>`
  ${({ $fullScreen }) =>
    $fullScreen &&
    css`
      display: flex;
      flex-direction: column;
      align-items: center;
    `}
`

export const FlexRow = styled.div<{ $fullScreen?: boolean }>`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;

  ${({ $fullScreen }) =>
    $fullScreen &&
    css`
      flex-direction: column;
    `}
`

export const ModuleTitle = styled.span<{
  $fullScreen?: boolean
  $modal?: boolean
}>`
  font-family: 'Graphik', sans-serif;
  font-size: 32px;
  font-weight: 600;
  word-break: break-word;
  margin-bottom: 20px;
  display: block;

  &::first-letter {
    text-transform: uppercase;
  }

  ${({ $fullScreen }) =>
    $fullScreen &&
    css`
      text-align: center;
    `}

  ${({ $modal }) =>
    $modal &&
    css`
      padding-top: 42px;
      font-size: 18px;
      line-height: 1;
    `}
`

export const ModuleText = styled.span<{ $fullScreen?: boolean }>`
  font-family: 'Graphik', sans-serif;
  font-size: 14px;
  line-height: 17px;
  word-break: break-word;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
  text-decoration: none;

  ${({ $fullScreen }) =>
    $fullScreen &&
    css`
      text-align: center;
    `}
`

export const BigText = styled.span<{
  $fullScreen?: boolean
  $modal?: boolean
}>`
  font-family: 'Graphik', sans-serif;
  font-size: 20px;
  line-height: 24px;
  word-break: break-word;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};

  ${({ $fullScreen }) =>
    $fullScreen &&
    css`
      text-align: center;
    `}

  ${({ $modal }) =>
    $modal &&
    css`
      font-size: 14px;
    `}
`

export const Icon = styled.span`
  width: 173px;
  margin-left: 15px;
  display: block;

  svg {
    width: 100%;
    height: auto;
  }
`

export const BigIcon = styled.span`
  width: 317px;
  margin-bottom: 42px;
  display: block;

  svg {
    width: 100%;
    height: auto;
  }
`

export const IconTelescope = styled.span`
  width: 250px;
  margin-left: 15px;
  display: block;

  svg {
    width: 100%;
    height: auto;
  }
`

export const List = styled.ul<{ $bloom?: boolean; $fullScreen?: boolean }>`
  ${({ $bloom }) =>
    $bloom &&
    css`
      display: flex;
      flex-wrap: wrap;
    `}

  ${({ $fullScreen }) =>
    $fullScreen &&
    css`
      display: flex;
      justify-content: center;
    `}
`

export const ListItem = styled.li<{ $fullScreen?: boolean; $bloom?: boolean }>`
  display: flex;

  ${({ $bloom }) =>
    $bloom &&
    css`
      margin-right: 18px;
    `}

  ${({ $fullScreen }) =>
    $fullScreen &&
    css`
      margin-right: 15px;

      &:last-child {
        margin-right: 0;
      }
    `}
`

export const IconWrapper = styled.div`
  display: flex;
  flex: 0 0 16px;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.icon.primary500};
  border-radius: 50%;
  margin-right: 10px;
`

export const ListIcon = styled.span`
  width: 10px;
  height: 10px;

  svg {
    width: 100%;
    height: 100%;
  }

  path {
    fill: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral100};
  }
`

export const LinksWrapper = styled.div<{ $fullScreen?: boolean }>`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;

  ${({ $fullScreen }) =>
    $fullScreen &&
    css`
      justify-content: center;
      flex-direction: column-reverse;
    `}
`

export const Link = styled.span<{ $fullScreen?: boolean }>`
  margin-right: 20px;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};

  ${({ $fullScreen }) =>
    $fullScreen &&
    css`
      margin-right: 0;

      &:first-child {
        margin-top: 13px;
      }
    `}
`

export const MarginBottom = styled.div`
  margin-bottom: 20px;
`

export const TextFooter = styled.span`
  font-weight: 500;
`

export const BtnLink = styled.span`
  /* Wrapper for button styling */
`
