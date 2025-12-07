import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
import { insightsOpen } from 'uiSrc/styles/mixins'
import { sectionContent } from 'uiSrc/pages/database-analysis/components/styles'

export const Wrapper = styled.div<React.HTMLAttributes<HTMLDivElement>>``

export const ChartsWrapper = styled.div<
  React.HTMLAttributes<HTMLDivElement> & {
    $isSection?: boolean
    $isLoading?: boolean
  }
>`
  display: flex;
  align-items: center;
  justify-content: space-around;
  ${insightsOpen()`
    flex-direction: column;
  `}
  ${({ $isSection }) => $isSection && sectionContent}
  ${({ $isLoading, theme }) =>
    $isLoading && `margin-top: ${theme.core.space.space400};`}
`

export const PreloaderCircle = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  width: 180px;
  height: 180px;
  margin: 60px 0;
  border-radius: 100%;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
`
export const LabelTooltip = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  font-size: 12px;
  font-weight: bold;
`

export const TooltipPercentage = styled.span<
  React.HTMLAttributes<HTMLSpanElement>
>`
  margin-right: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
`

export const TitleSeparator = styled.hr<React.HTMLAttributes<HTMLHRElement>>`
  height: 1px;
  border: 0;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.border.neutral500};
  margin: ${({ theme }: { theme: Theme }) => theme.core.space.space050} 0;
  min-width: 60px;
  width: 100%;
`
