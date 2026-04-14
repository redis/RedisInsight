import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import {
  IndexField,
  VectorAlgorithm,
  VectorFieldOptions as VectorFieldOptionsType,
  TextFieldOptions as TextFieldOptionsType,
} from '../index-details/IndexDetails.types'
import { FieldTypeModalMode } from './FieldTypeModal.types'
import {
  VECTOR_ALGORITHM_DEFAULT,
  VECTOR_DATA_TYPE_DEFAULT,
  VECTOR_DISTANCE_METRIC_DEFAULT,
  VECTOR_CONSTRAINTS,
  TEXT_CONSTRAINTS,
} from './FieldTypeModal.constants'
import { FieldTypeFormValues } from './components/FieldTypeForm/FieldTypeForm.types'

export const getInitialValues = (
  mode: FieldTypeModalMode,
  field?: IndexField,
): FieldTypeFormValues => {
  if (mode === FieldTypeModalMode.Edit && field) {
    const vectorOptions = field.options as VectorFieldOptionsType | undefined
    const textOptions = field.options as TextFieldOptionsType | undefined

    return {
      fieldName: field.name,
      fieldType: field.type,
      algorithm:
        field.type === FieldTypes.VECTOR &&
        vectorOptions &&
        'algorithm' in vectorOptions
          ? vectorOptions.algorithm
          : VECTOR_ALGORITHM_DEFAULT,
      dataType:
        field.type === FieldTypes.VECTOR && vectorOptions
          ? (vectorOptions.dataType ?? VECTOR_DATA_TYPE_DEFAULT)
          : VECTOR_DATA_TYPE_DEFAULT,
      dimensions:
        field.type === FieldTypes.VECTOR && vectorOptions
          ? vectorOptions.dimensions
          : VECTOR_CONSTRAINTS.DIMENSIONS_DEFAULT,
      distanceMetric:
        field.type === FieldTypes.VECTOR && vectorOptions
          ? (vectorOptions.distanceMetric ?? VECTOR_DISTANCE_METRIC_DEFAULT)
          : VECTOR_DISTANCE_METRIC_DEFAULT,
      maxEdges:
        field.type === FieldTypes.VECTOR &&
        vectorOptions &&
        'maxEdges' in vectorOptions
          ? vectorOptions.maxEdges
          : VECTOR_CONSTRAINTS.MAX_EDGES_DEFAULT,
      maxNeighbors:
        field.type === FieldTypes.VECTOR &&
        vectorOptions &&
        'maxNeighbors' in vectorOptions
          ? vectorOptions.maxNeighbors
          : VECTOR_CONSTRAINTS.MAX_NEIGHBORS_DEFAULT,
      candidateLimit:
        field.type === FieldTypes.VECTOR &&
        vectorOptions &&
        'candidateLimit' in vectorOptions
          ? vectorOptions.candidateLimit
          : VECTOR_CONSTRAINTS.CANDIDATE_LIMIT_DEFAULT,
      epsilon:
        field.type === FieldTypes.VECTOR &&
        vectorOptions &&
        'epsilon' in vectorOptions
          ? vectorOptions.epsilon
          : VECTOR_CONSTRAINTS.EPSILON_DEFAULT,
      weight:
        field.type === FieldTypes.TEXT && textOptions
          ? (textOptions.weight ?? TEXT_CONSTRAINTS.WEIGHT_DEFAULT)
          : TEXT_CONSTRAINTS.WEIGHT_DEFAULT,
      phonetic:
        field.type === FieldTypes.TEXT && textOptions
          ? textOptions.phonetic
          : undefined,
    }
  }

  return {
    fieldName: '',
    fieldType: FieldTypes.TEXT,
    algorithm: VECTOR_ALGORITHM_DEFAULT,
    dataType: VECTOR_DATA_TYPE_DEFAULT,
    dimensions: VECTOR_CONSTRAINTS.DIMENSIONS_DEFAULT,
    distanceMetric: VECTOR_DISTANCE_METRIC_DEFAULT,
    maxEdges: VECTOR_CONSTRAINTS.MAX_EDGES_DEFAULT,
    maxNeighbors: VECTOR_CONSTRAINTS.MAX_NEIGHBORS_DEFAULT,
    candidateLimit: VECTOR_CONSTRAINTS.CANDIDATE_LIMIT_DEFAULT,
    epsilon: VECTOR_CONSTRAINTS.EPSILON_DEFAULT,
    weight: TEXT_CONSTRAINTS.WEIGHT_DEFAULT,
    phonetic: undefined,
  } as FieldTypeFormValues
}

export const buildFieldFromValues = (
  values: FieldTypeFormValues,
  mode: FieldTypeModalMode,
  existingField?: IndexField,
): IndexField => {
  const id =
    mode === FieldTypeModalMode.Edit && existingField
      ? existingField.id
      : values.fieldName.trim()

  const base: IndexField = {
    id,
    name:
      mode === FieldTypeModalMode.Edit && existingField
        ? existingField.name
        : values.fieldName.trim(),
    value:
      mode === FieldTypeModalMode.Edit && existingField
        ? existingField.value
        : '',
    type: values.fieldType,
  }

  if (values.fieldType === FieldTypes.VECTOR) {
    const shared = {
      dimensions: values.dimensions,
      distanceMetric: values.distanceMetric,
      dataType: values.dataType,
    }

    base.options =
      values.algorithm === VectorAlgorithm.HNSW
        ? {
            algorithm: VectorAlgorithm.HNSW,
            ...shared,
            maxEdges: values.maxEdges,
            maxNeighbors: values.maxNeighbors,
            candidateLimit: values.candidateLimit,
            epsilon: values.epsilon,
          }
        : {
            algorithm: VectorAlgorithm.FLAT,
            ...shared,
          }
  } else if (values.fieldType === FieldTypes.TEXT) {
    base.options = {
      weight: values.weight,
      phonetic: values.phonetic,
    }
  }

  return base
}
