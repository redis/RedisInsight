import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Wrapper = styled(Row).attrs({
  align: 'center',
  justify: 'around',
})`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  margin-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
`

export const LoadingWrapper = styled(Wrapper)`
  margin-top: ${({ theme }: { theme: Theme }) => theme.core.space.space400};
`

export const ChartCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const ChartTitle = styled(Row).attrs({
  align: 'center',
})``

export const Icon = styled.span`
  margin-right: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
`

export const TitleSeparator = styled.hr`
  height: 1px;
  border: 0;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.border.neutral300};
  margin: ${({ theme }: { theme: Theme }) => theme.core.space.space050} 0;
  width: 60px;
`

export const CenterCount = styled.div`
  margin-top: 2px;
  font-weight: 500;
  font-size: 14px;
`

export const PreloaderCircle = styled.div`
  width: 180px;
  height: 180px;
  margin: 60px 0;
  border-radius: 100%;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.border.neutral300};
`

export const LabelTooltip = styled.div`
  font-size: 12px;
`

export const TooltipTitle = styled.div`
  margin-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
`

export const TooltipPercentage = styled.span`
  margin-right: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
`
