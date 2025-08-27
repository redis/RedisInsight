import React from 'react'
import { Button } from 'uiSrc/components/base/forms/buttons'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import NoIndexesIcon from 'uiSrc/assets/img/vector-search/no-indexes.svg'
import NoSavedQueries from 'uiSrc/assets/img/vector-search/no-saved-queries.svg'
import useStartWizard from '../hooks/useStartWizard'
import { StyledContainer, StyledImage } from './NoIndexesMessage.styles'

export enum NoDataMessageKeys {
  ManageIndexes = 'manage-indexes',
  SavedQueries = 'saved-queries',
}

export interface NoDataMessageDetails {
  title: string
  description: string
  icon: string
}

export const NO_DATA_MESSAGES: Record<NoDataMessageKeys, NoDataMessageDetails> =
  {
    [NoDataMessageKeys.ManageIndexes]: {
      title: 'No indexes.',
      description:
        'Start with vector search onboarding to explore sample data, or create an index and write queries in the smart editor.',
      icon: NoIndexesIcon,
    },
    [NoDataMessageKeys.SavedQueries]: {
      title: 'No saved queries.',
      description:
        'Start with vector search onboarding to explore sample data, or write queries in the smart editor.',
      icon: NoSavedQueries,
    },
  }

export interface NoIndexesMessageProps {
  variant: NoDataMessageKeys
}

const NoIndexesMessage = ({ variant }: NoIndexesMessageProps) => {
  const start = useStartWizard()
  const { title, description, icon } = NO_DATA_MESSAGES[variant]

  return (
    <StyledContainer gap="xxl" data-testid="no-indexes-message">
      <StyledImage src={icon} alt={title} as="img" />

      <Col gap="m">
        <Text size="M">{title}</Text>
        <Text size="S">{description}</Text>
      </Col>

      <Button variant="secondary-invert" onClick={start}>
        Get started
      </Button>
    </StyledContainer>
  )
}

export default NoIndexesMessage
