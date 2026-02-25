import React from 'react'
import { FormikErrors, FormikProps } from 'formik'
import { Row, Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import NumericInput from 'uiSrc/components/base/inputs/NumericInput'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'

import {
  VectorAlgorithm,
  VectorDataType,
  VectorDistanceMetric,
} from '../../../index-details/IndexDetails.types'
import {
  VECTOR_CONSTRAINTS,
  VECTOR_ALGORITHM_OPTIONS,
  VECTOR_DISTANCE_METRIC_OPTIONS,
} from '../../FieldTypeModal.constants'
import { useVectorDataTypeOptions } from '../../hooks/useVectorDataTypeOptions'
import {
  AllFieldTypeFormFields,
  FieldTypeFormValues,
} from '../FieldTypeForm/FieldTypeForm.types'

export interface VectorFieldOptionsProps {
  formik: FormikProps<FieldTypeFormValues>
}

export const VectorFieldOptions = ({ formik }: VectorFieldOptionsProps) => {
  const { values, setFieldValue } = formik
  const errors = formik.errors as FormikErrors<AllFieldTypeFormFields>
  const isHnsw = values.algorithm === VectorAlgorithm.HNSW
  const vectorDataTypeOptions = useVectorDataTypeOptions()

  return (
    <Col gap="l">
      <Row gap="l">
        <FlexItem grow>
          <FormField
            label="Algorithm"
            infoIconProps={{
              content:
                'Use FLAT for small datasets or when exact accuracy matters. Use HNSW for larger datasets or when fast search is important.',
            }}
          >
            <RiSelect
              options={VECTOR_ALGORITHM_OPTIONS}
              value={values.algorithm}
              onChange={(val: string) =>
                setFieldValue('algorithm', val as VectorAlgorithm)
              }
              data-testid="field-type-modal-vector-algorithm"
            />
          </FormField>
        </FlexItem>

        <FlexItem grow>
          <FormField label="Vector type">
            <RiSelect
              options={vectorDataTypeOptions}
              value={values.dataType}
              onChange={(val: string) =>
                setFieldValue('dataType', val as VectorDataType)
              }
              data-testid="field-type-modal-vector-data-type"
            />
          </FormField>
        </FlexItem>
      </Row>

      <Row gap="l">
        <FlexItem grow>
          <FormField
            label="Dimensions"
            infoIconProps={{
              content:
                'Number of dimensions in each vector. Query vectors must match this size.',
            }}
          >
            <NumericInput
              value={values.dimensions ?? null}
              onChange={(val: number | null) =>
                setFieldValue('dimensions', val ?? undefined)
              }
              error={errors.dimensions}
              min={VECTOR_CONSTRAINTS.DIMENSIONS_MIN}
              max={VECTOR_CONSTRAINTS.DIMENSIONS_MAX}
              data-testid="field-type-modal-vector-dimensions"
            />
          </FormField>
        </FlexItem>

        <FlexItem grow>
          <FormField
            label="Distance metric"
            infoIconProps={{
              content: 'Distance metric for vector comparison.',
            }}
          >
            <RiSelect
              options={VECTOR_DISTANCE_METRIC_OPTIONS}
              value={values.distanceMetric}
              onChange={(val: string) =>
                setFieldValue('distanceMetric', val as VectorDistanceMetric)
              }
              data-testid="field-type-modal-vector-distance-metric"
            />
          </FormField>
        </FlexItem>
      </Row>

      {isHnsw && (
        <>
          <Row gap="l">
            <FlexItem grow>
              <FormField
                label="Max Edges"
                infoIconProps={{
                  content:
                    'Maximum outgoing edges per node. Higher values improve accuracy but increase memory.',
                }}
              >
                <NumericInput
                  value={values.maxEdges ?? null}
                  onChange={(val: number | null) =>
                    setFieldValue('maxEdges', val ?? undefined)
                  }
                  error={errors.maxEdges}
                  min={VECTOR_CONSTRAINTS.MAX_EDGES_MIN}
                  max={VECTOR_CONSTRAINTS.MAX_EDGES_MAX}
                  data-testid="field-type-modal-vector-max-edges"
                />
              </FormField>
            </FlexItem>

            <FlexItem grow>
              <FormField
                label="Max Neighbors"
                infoIconProps={{
                  content:
                    'Maximum neighbors considered during graph build. Higher values improve accuracy but slow indexing.',
                }}
              >
                <NumericInput
                  value={values.maxNeighbors ?? null}
                  onChange={(val: number | null) =>
                    setFieldValue('maxNeighbors', val ?? undefined)
                  }
                  error={errors.maxNeighbors}
                  min={VECTOR_CONSTRAINTS.MAX_NEIGHBORS_MIN}
                  max={VECTOR_CONSTRAINTS.MAX_NEIGHBORS_MAX}
                  data-testid="field-type-modal-vector-max-neighbors"
                />
              </FormField>
            </FlexItem>
          </Row>

          <Row gap="l">
            <FlexItem grow>
              <FormField
                label="Candidate Limit"
                infoIconProps={{
                  content:
                    'Max top candidates considered during KNN search. Higher values improve accuracy but increase latency.',
                }}
              >
                <NumericInput
                  value={values.candidateLimit ?? null}
                  onChange={(val: number | null) =>
                    setFieldValue('candidateLimit', val ?? undefined)
                  }
                  error={errors.candidateLimit}
                  min={VECTOR_CONSTRAINTS.CANDIDATE_LIMIT_MIN}
                  max={VECTOR_CONSTRAINTS.CANDIDATE_LIMIT_MAX}
                  data-testid="field-type-modal-vector-candidate-limit"
                />
              </FormField>
            </FlexItem>

            <FlexItem grow>
              <FormField
                label="Epsilon"
                infoIconProps={{
                  content:
                    'Relative factor for range query boundaries. Higher values widen the search.',
                }}
              >
                <NumericInput
                  value={values.epsilon ?? null}
                  onChange={(val: number | null) =>
                    setFieldValue('epsilon', val ?? undefined)
                  }
                  error={errors.epsilon}
                  min={VECTOR_CONSTRAINTS.EPSILON_MIN}
                  step={0.01}
                  data-testid="field-type-modal-vector-epsilon"
                />
              </FormField>
            </FlexItem>
          </Row>
        </>
      )}
    </Col>
  )
}
