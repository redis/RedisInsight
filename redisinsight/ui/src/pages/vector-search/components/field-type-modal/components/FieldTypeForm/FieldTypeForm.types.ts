import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  VectorFlatFieldOptions,
  VectorHnswFieldOptions,
  TextFieldOptions,
} from '../../../index-details/IndexDetails.types'

export interface BaseFieldFormValues {
  fieldName: string
  fieldType: FieldTypes
}

export type TextFieldFormValues = TextFieldOptions

export type VectorFlatFieldFormValues = VectorFlatFieldOptions

export type VectorHnswFieldFormValues = VectorHnswFieldOptions

export type VectorFieldFormValues =
  | VectorFlatFieldFormValues
  | VectorHnswFieldFormValues

export type FieldTypeFormValues = BaseFieldFormValues &
  TextFieldFormValues &
  VectorFieldFormValues

export type AllFieldTypeFormFields = BaseFieldFormValues &
  TextFieldFormValues &
  VectorHnswFieldFormValues
