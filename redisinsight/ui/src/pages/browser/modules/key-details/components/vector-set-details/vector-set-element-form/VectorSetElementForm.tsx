import React from 'react'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'

import { useVectorSetElementForm } from '../hooks'

import VectorSetElementFormFields from './VectorSetElementFormFields'
import { Props } from './interfaces'

const VectorSetElementForm = (props: Props) => {
  const { onSubmit, onCancel, loading, vectorDim, submitText = 'Save' } = props

  const formApi = useVectorSetElementForm({ vectorDim, onSubmit })

  return (
    <Col gap="m">
      <VectorSetElementFormFields {...formApi} loading={loading} />
      <Row justify="end" gap="m">
        <FlexItem>
          <SecondaryButton
            onClick={() => onCancel(true)}
            data-testid="cancel-elements-btn"
          >
            Cancel
          </SecondaryButton>
        </FlexItem>
        <FlexItem>
          <PrimaryButton
            disabled={loading || !formApi.isFormValid}
            loading={loading}
            onClick={formApi.submitData}
            data-testid="save-elements-btn"
          >
            {submitText}
          </PrimaryButton>
        </FlexItem>
      </Row>
    </Col>
  )
}

export default VectorSetElementForm
