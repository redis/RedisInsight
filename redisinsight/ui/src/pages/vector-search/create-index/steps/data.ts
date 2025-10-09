import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { VectorSearchBox } from 'uiSrc/components/new-index/create-index-step/field-box/types'

export const bikesIndexFieldsBoxes: VectorSearchBox[] = [
  {
    value: 'model',
    label: 'model',
    text: 'Product model',
    tag: FieldTypes.TEXT,
    disabled: true,
  },
  {
    value: 'brand',
    label: 'brand',
    text: 'Product brand',
    tag: FieldTypes.TEXT,
    disabled: true,
  },
  {
    value: 'price',
    label: 'price',
    text: 'Product price',
    tag: FieldTypes.NUMERIC,
    disabled: true,
  },
  {
    value: 'type',
    label: 'type',
    text: 'Product type',
    tag: FieldTypes.TAG,
    disabled: true,
  },
  {
    value: 'material',
    label: 'material',
    text: 'Product material',
    tag: FieldTypes.TAG,
    disabled: true,
  },
  {
    value: 'weight',
    label: 'weight',
    text: 'Product weight',
    tag: FieldTypes.NUMERIC,
    disabled: true,
  },
  {
    value: 'description_embeddings',
    label: 'description_embeddings',
    text: 'Product embedding vector',
    tag: FieldTypes.VECTOR,
    disabled: true,
  },
]

export const selectedBikesIndexFields = bikesIndexFieldsBoxes.map(
  (field) => field.value,
)

export const moviesIndexFieldsBoxes: VectorSearchBox[] = [
  {
    value: 'title',
    label: 'title',
    text: 'Movie title',
    tag: FieldTypes.TEXT,
    disabled: true,
  },
  {
    value: 'genres',
    label: 'genres',
    text: 'Movie genre',
    tag: FieldTypes.TAG,
    disabled: true,
  },
  {
    value: 'plot',
    label: 'plot',
    text: 'Movie plot',
    tag: FieldTypes.TEXT,
    disabled: true,
  },
  {
    value: 'year',
    label: 'year',
    text: 'Movie year',
    tag: FieldTypes.NUMERIC,
    disabled: true,
  },
  {
    value: 'embedding',
    label: 'embedding',
    text: 'Movie embedding vector',
    tag: FieldTypes.VECTOR,
    disabled: true,
  },
]

export const selectedMoviesIndexFields = moviesIndexFieldsBoxes.map(
  (field) => field.value,
)
