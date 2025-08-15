import React from 'react'
import { Button } from 'uiSrc/components/base/forms/buttons'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import useStartWizard from '../hooks/useStartWizard'

const NoIndexesMessage = () => {
  const { start } = useStartWizard()

  return (
    <Col gap="m">
      <Text size="L">No indexes to display yet.</Text>

      <Text>
        Complete vector search onboarding to create your first index with sample
        data, or create one manually.
      </Text>

      <Button onClick={start}>Get started</Button>
    </Col>
  )
}

export default NoIndexesMessage
