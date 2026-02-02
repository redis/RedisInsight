import styled from 'styled-components'
import { FlexGroup, Row } from 'uiSrc/components/base/layout/flex'

export const StyledFeatures = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(18rem, 1fr));
  gap: ${({ theme }) => theme.core.space.space200};
  align-items: stretch;
  justify-items: stretch;
  max-width: 90rem;
  margin: 0 auto;
  z-index: 1;
  margin-bottom: 32px;
`

export const FeatureCard = styled(FlexGroup)`
  max-width: 216px;
  text-align: center;
  gap: ${({ theme }) => theme.core.space.space100};
  padding: 16px; // ${({ theme }) => theme.core.space.space150};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral600};
  border-radius: 4px; // ${({ theme }) => theme.components.card.borderRadius};
`

export const FeatureTitleWrapper = styled(Row)`
  align-items: center;
  gap: 4px; // ${({ theme }) => theme.core.space.space100};
`
