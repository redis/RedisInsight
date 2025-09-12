import React from 'react'
import {
  FeatureCard,
  FeatureTitleWrapper,
  StyledFeatures,
} from './Features.styles'
import { Text } from 'uiSrc/components/base/text'
import { CheckBoldIcon } from 'uiSrc/components/base/icons'

export interface Feature {
  title: string
  text: string
}

const VECTOR_SEARCH_ONBOARDING_FEATURES: Feature[] = [
  {
    title: 'Unmatched performance',
    text: 'Lightning-fast vector search with instant results',
  },
  {
    title: 'Effortless scaling',
    text: 'Seamless scaling for growing workloads.',
  },
  {
    title: 'AI-ready',
    text: 'Power your AI and ML applications',
  },
]

const Features: React.FC = () => (
  <StyledFeatures as="div" data-testid="vector-search-onboarding--features">
    {VECTOR_SEARCH_ONBOARDING_FEATURES.map((item) => (
      <FeatureCard
        direction="column"
        align="center"
        justify="center"
        key={item.title}
      >
        <FeatureTitleWrapper grow={false}>
          <CheckBoldIcon color="success500" />
          <Text size="M" color="primary" variant="semiBold">
            {item.title}
          </Text>
        </FeatureTitleWrapper>
        <Text size="S" color="secondary">
          {item.text}
        </Text>
      </FeatureCard>
    ))}
  </StyledFeatures>
)

export default Features
