import { ToastVariant } from 'uiSrc/components/base/display/toast/RiToast'

export const VEC2WORD_COLLECTION_NAME = 'vec2word'

export interface Vec2WordPreviewRow {
  word: string
  vector: string
  attributes: string
}

export const VEC2WORD_PREVIEW: Vec2WordPreviewRow[] = [
  {
    word: 'king',
    vector: '[0.012, -0.045, 0.083, …]',
    attributes: '{"pos":"noun"}',
  },
  {
    word: 'queen',
    vector: '[0.034, 0.067, -0.021, …]',
    attributes: '{"pos":"noun"}',
  },
  {
    word: 'apple',
    vector: '[-0.011, 0.054, 0.092, …]',
    attributes: '{"pos":"noun"}',
  },
]

export interface Vec2WordInfoRow {
  label: string
  value: string
}

export const VEC2WORD_INFO: Vec2WordInfoRow[] = [
  { label: 'Dataset', value: 'vec2word' },
  { label: 'Size', value: '100' },
  { label: 'Vector size', value: '300' },
  { label: 'Embedding', value: 'GloVe' },
]

/** Toast shown when the bulk-import POST for `vec2word` fails. */
export const loadSampleDatasetFailedNotification = () => ({
  title: 'Failed to create vector set',
  message: 'Please try again.',
  variant: 'danger' as ToastVariant,
})

/**
 * Toast shown when the user clicks "Add key" with sample-dataset mode but the
 * target `vec2word` key already exists. Mirrors the vector-search
 * `sampleDataAlreadyExists` notice variant.
 */
export const loadSampleDatasetAlreadyExistsNotification = () => ({
  title: 'Sample dataset already loaded',
  message: `A key named '${VEC2WORD_COLLECTION_NAME}' already exists in this database.`,
  variant: 'notice' as ToastVariant,
  showCloseButton: false,
})
