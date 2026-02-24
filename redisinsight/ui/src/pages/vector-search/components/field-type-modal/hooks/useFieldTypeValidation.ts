import { useCallback } from 'react'
import { FormikErrors } from 'formik'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import {
  IndexField,
  VectorAlgorithm,
} from '../../index-details/IndexDetails.types'
import {
  VECTOR_CONSTRAINTS,
  TEXT_CONSTRAINTS,
  VALIDATION_MESSAGES,
} from '../FieldTypeModal.constants'
import {
  FieldTypeFormValues,
  AllFieldTypeFormFields,
} from '../components/FieldTypeForm/FieldTypeForm.types'
import { FieldTypeModalMode } from '../FieldTypeModal.types'

const isInRange = (
  value: number | undefined,
  min: number,
  max: number,
): boolean => value !== undefined && value >= min && value <= max

export const useFieldTypeValidation = (
  mode: FieldTypeModalMode,
  fields: IndexField[],
  _editingField?: IndexField,
) =>
  useCallback(
    (values: FieldTypeFormValues): FormikErrors<AllFieldTypeFormFields> => {
      const errors: FormikErrors<AllFieldTypeFormFields> = {}

      if (mode === FieldTypeModalMode.Create) {
        if (!values.fieldName?.trim()) {
          errors.fieldName = VALIDATION_MESSAGES.FIELD_NAME_REQUIRED
        } else if (fields.some((f) => f.name === values.fieldName.trim())) {
          errors.fieldName = VALIDATION_MESSAGES.FIELD_NAME_DUPLICATE
        }
      }

      if (values.fieldType === FieldTypes.VECTOR) {
        if (values.dimensions === undefined) {
          errors.dimensions = VALIDATION_MESSAGES.DIMENSIONS_REQUIRED
        } else if (
          !isInRange(
            values.dimensions,
            VECTOR_CONSTRAINTS.DIMENSIONS_MIN,
            VECTOR_CONSTRAINTS.DIMENSIONS_MAX,
          )
        ) {
          errors.dimensions = VALIDATION_MESSAGES.DIMENSIONS_RANGE
        }

        if (values.algorithm === VectorAlgorithm.HNSW) {
          if (
            values.maxEdges !== undefined &&
            !isInRange(
              values.maxEdges,
              VECTOR_CONSTRAINTS.MAX_EDGES_MIN,
              VECTOR_CONSTRAINTS.MAX_EDGES_MAX,
            )
          ) {
            errors.maxEdges = VALIDATION_MESSAGES.MAX_EDGES_RANGE
          }

          if (
            values.maxNeighbors !== undefined &&
            !isInRange(
              values.maxNeighbors,
              VECTOR_CONSTRAINTS.MAX_NEIGHBORS_MIN,
              VECTOR_CONSTRAINTS.MAX_NEIGHBORS_MAX,
            )
          ) {
            errors.maxNeighbors = VALIDATION_MESSAGES.MAX_NEIGHBORS_RANGE
          }

          if (
            values.candidateLimit !== undefined &&
            !isInRange(
              values.candidateLimit,
              VECTOR_CONSTRAINTS.CANDIDATE_LIMIT_MIN,
              VECTOR_CONSTRAINTS.CANDIDATE_LIMIT_MAX,
            )
          ) {
            errors.candidateLimit = VALIDATION_MESSAGES.CANDIDATE_LIMIT_RANGE
          }

          if (
            values.epsilon !== undefined &&
            values.epsilon < VECTOR_CONSTRAINTS.EPSILON_MIN
          ) {
            errors.epsilon = VALIDATION_MESSAGES.EPSILON_MIN
          }
        }
      }

      if (values.fieldType === FieldTypes.TEXT) {
        if (
          values.weight !== undefined &&
          values.weight <= TEXT_CONSTRAINTS.WEIGHT_MIN
        ) {
          errors.weight = VALIDATION_MESSAGES.WEIGHT_MIN
        }
      }

      return errors
    },
    [mode, fields, _editingField],
  )
